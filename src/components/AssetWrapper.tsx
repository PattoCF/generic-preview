import React from 'react'
import { WrapperProps } from './Interfaces.js'

export class AssetWrapper extends React.Component <WrapperProps> {
  render() {
    return ((this.props.asset && (
      <img src={this.props.asset.fields.file[this.props.sdk.locales.default].url} alt={this.props.asset.fields.title[this.props.sdk.locales.default]} />
    )) || <></>)
  }
}

