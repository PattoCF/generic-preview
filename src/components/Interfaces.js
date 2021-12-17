import { EditorExtensionSDK } from '@contentful/app-sdk'
import { Asset, Entry, ContentType } from '@contentful/field-editor-shared'

export interface EditorProps {
  sdk: EditorExtensionSDK,
}

export interface EntryOrAsset {
  entry?: {
    entry: Entry,
    contentType: ContentType,
    displayField: string
  },
  asset?: Asset
}

export interface WrapperProps {
  sdk: EditorExtensionSDK,
  id?: string,
  linkType?: string,
  data?: EntryOrAsset,
  entry?: {
    entry: Entry,
    contentType: ContentType,
    displayField: string
  },
  asset?: Asset
}

export interface ConfigState {
  fields: object,
  entry: any
}

export interface EntryState {
  entry?: Entry,
  contentType?: ContentType,
  displayField?: string
}

