import React from 'react'
import { WrapperProps, EntryState } from './Interfaces.js'

export class EntryWrapper extends React.Component <WrapperProps, EntryState> {
  render() {
    return ((this.props.entry?.entry && (<>
      Links to <a href={"https://app.contentful.com/spaces/" + this.props.sdk.ids.space + "/entries/" + this.props.id} target="_new">
        {this.props.entry?.entry.fields[this.props.entry.displayField || ''][this.props.sdk.locales.default]}
      </a> [{this.props.entry?.contentType?.name || ''}]
    </>)) || <></>)
  }
}

