import { TiendaNubeIntegrationDialog } from './tienda-nube-integration-dialog'
import { WordPressIntegrationDialog } from './wordpress-integration-dialog'

export enum ModalType {
  Wordpress = 'wordpress',
  'TiendaNube' = 'tienda-nube',
}

export const modalComponents = {
  [ModalType.Wordpress]: WordPressIntegrationDialog,
  [ModalType.TiendaNube]: TiendaNubeIntegrationDialog,
} as const
