import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import ms from 'src/lib/utils/ms';
import {
  QuickNodeTemplateId,
  QuickNodeTemplateWebhookPayload,
  QuickNodeWebhookCreatePayload,
  QuickNodeWebhookResponse,
} from './quicknode.types';
import { Env, getEnv } from 'src/lib/utils/env';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class QuickNodeService {
  private readonly logger = new Logger(QuickNodeService.name);
  private readonly httpClient: AxiosInstance;
  private readonly apiKey: string;

  constructor() {
    this.apiKey = getEnv(Env.QUICKNODE_API_KEY);
    if (!this.apiKey) throw new Error('Missing QUICKNODE_API_KEY');

    this.httpClient = axios.create({
      baseURL: 'https://api.quicknode.com',
      timeout: ms('10s'),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    });
  }
  isValidWebhookSignature(args: {
    signature: string;
    nonce: string;
    timestamp: string;
    rawBody: string;
  }): boolean {
    const { signature, nonce, timestamp, rawBody } = args;
    const message = nonce + timestamp + rawBody;

    const computed = createHmac(
      'sha256',
      getEnv(Env.QUICKNODE_WEBHOOK_SECURITY_TOKEN),
    )
      .update(message)
      .digest('hex');

    return timingSafeEqual(
      Buffer.from(computed, 'hex'),
      Buffer.from(signature, 'hex'),
    );
  }
  async createWebhook(
    payload: QuickNodeWebhookCreatePayload,
  ): Promise<QuickNodeWebhookResponse> {
    try {
      this.logger.log(`Creating webhook → ${payload.network}`);
      const response = await this.httpClient.post(
        '/webhooks/rest/v1/webhooks',
        payload,
      );
      this.logger.log(`Webhook created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error(error instanceof Error ? error.message : String(error));
      throw new Error(`QuickNode webhook error: ${error}`);
    }
  }

  async addEvmWalletToWebhook(args: {
    webhookId: string;
    wallets: string[];
  }): Promise<QuickNodeWebhookResponse> {
    const { webhookId, wallets } = args;
    const webhook = await this.getWebhookById(webhookId);
    this.logger.log(`Webhook: ${JSON.stringify(webhook, null, 2)}`);
    const currentTrackedWallets = this.extractEvmWalletsFromFilterFunction(
      webhook.filter_function,
    );

    const updatedWebhook = await this.updateWebhookTemplate({
      webhookId,
      templateId: 'evmWalletFilter',
      payload: {
        templateArgs: {
          wallets: [...currentTrackedWallets, ...wallets],
        },
        network: webhook.network,
        destination_attributes: {
          url: webhook.destination_attributes.url,
          compression: 'none',
          security_token: webhook.destination_attributes.security_token,
        },
      },
    });
    return updatedWebhook;
  }
  async updateWebhookTemplate(args: {
    webhookId: string;
    templateId: QuickNodeTemplateId;
    payload: QuickNodeTemplateWebhookPayload;
  }): Promise<QuickNodeWebhookResponse> {
    const { webhookId, templateId, payload } = args;
    try {
      this.logger.log(`Updating webhook template ${templateId} → ${webhookId}`);

      const response = await this.httpClient.patch(
        `/webhooks/rest/v1/webhooks/${webhookId}/template/${templateId}`,
        payload,
      );

      this.logger.log(`Template webhook updated: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to update template webhook: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new Error(`QuickNode update template error: ${error}`);
    }
  }
  async createWebhookFromTemplate(
    templateId: QuickNodeTemplateId,
    payload: QuickNodeTemplateWebhookPayload,
  ): Promise<QuickNodeWebhookResponse> {
    try {
      this.logger.log(
        `Creating webhook from template ${templateId} → ${payload.network}`,
      );

      const response = await this.httpClient.post(
        `/webhooks/rest/v1/webhooks/template/${templateId}`,
        payload,
      );

      this.logger.log(`Template webhook created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to create template webhook: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new Error(`QuickNode template error: ${error}`);
    }
  }

  async deleteWebhook(id: string): Promise<void> {
    try {
      this.logger.log(`Deleting webhook ID: ${id}`);
      await this.httpClient.delete(`/webhooks/rest/v1/webhooks/${id}`);
      this.logger.log(`Webhook deleted: ${id}`);
    } catch (error) {
      this.logger.error(error);
      throw new Error(`QuickNode delete error: ${error}`);
    }
  }

  async getWebhookStatus(id: string): Promise<QuickNodeWebhookResponse> {
    try {
      const response = await this.httpClient.get(
        `/webhooks/rest/v1/webhooks/${id}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw new Error(`QuickNode status error: ${error}`);
    }
  }
  async getWebhookById(id: string): Promise<QuickNodeWebhookResponse> {
    try {
      const response = await this.httpClient.get(
        `/webhooks/rest/v1/webhooks/${id}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw new Error(`QuickNode get webhook error: ${error}`);
    }
  }

  private extractEvmWalletsFromFilterFunction(base64: string): string[] {
    try {
      const decoded = Buffer.from(base64, 'base64').toString('utf8');

      const match = decoded.match(/const wallets = new Set\(\[([^\]]+)\]/);
      if (!match || !match[1]) return [];

      const raw = match[1]
        .split(',')
        .map((w) => w.trim().replace(/['"]/g, '').toLowerCase());

      return Array.from(new Set(raw));
    } catch (err) {
      this.logger.error('Failed to extract wallets from filter_function', err);
      return [];
    }
  }
}
