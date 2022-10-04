import React from 'react'
import { WrapperProps } from './Interfaces.js'
import { AssetWrapper } from './AssetWrapper'
import { EntryWrapper } from './EntryWrapper'

export class LinkWrapper extends React.Component<WrapperProps> {
  render() {
    if (this.props.linkType === 'Asset') {
      return <AssetWrapper id={this.props.id} sdk={this.props.sdk} asset={this.props.data?.asset} />
    } else if (this.props.linkType === 'Entry') {
      return <EntryWrapper id={this.props.id} sdk={this.props.sdk} entry={this.props.data?.entry} />
    } else {
      return <></>
    }
  }
}

