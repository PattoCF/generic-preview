import React from 'react'
import  ReactDOMServer  from 'react-dom/server'
import { Workbench, Typography, Button, HelpText, Select,Option } from '@contentful/forma-36-react-components'
import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import { EditorProps, EntryOrAsset, ConfigState, LinkProps, EntryState } from './Interfaces.js'
import { Asset, Entry, ContentType } from '@contentful/field-editor-shared'
import { LinkWrapper } from './LinkWrapper'

export default class EntryEditor extends React.Component <EditorProps, ConfigState> {
  async componentDidMount() {
    try {
      Object.keys(this.props.sdk.entry.fields).forEach(async (keyName, i) => {
        document.getElementById('mydiv' + i + 'header')!.innerHTML = await this.getFieldValue(this.props.sdk.entry.fields[keyName].id, i)
        this.dragElement(document.getElementById('mydiv' + i.toString())!)
      })
    } catch(err) {
      console.log(err)
    }
  }

  async getFieldValue(field: string, i: number) {
    let fieldValue = this.props.sdk.entry.fields[field].getValue()

    // let's not handle these now, we need a case later for all of the field types
    switch(this.props.sdk.entry.fields[field].type) {
      case 'Symbol':
      case 'Text':
      case 'Integer':
      case 'Number':
        return fieldValue
      case 'Date':
        //convert the date to a more readable format
        return new Date(fieldValue).toISOString().split('T')[0]
      case 'Location':
        // render the location on a Google Map
        // todo: use different key
        let lat = fieldValue.lat
        let long = fieldValue.lon
        return '<img src="https://maps.googleapis.com/maps/api/staticmap?center='
          + lat + ',' + long + '&zoom=12&size=200x200&markers=color:red%7Clabel:Location%7C'
          + lat + ',' + long + '&key=AIzaSyDKWGl_R9LCIbyDfjd4HWAJXlA-i40HFLo" />'
      case 'Boolean':
        return fieldValue ? 'true' : 'false'
      case 'Link':
        return await this.renderLinkAsHTMLComponent(fieldValue, fieldValue.sys.linkType)
      case 'RichText':
        //convert the Rich Text to HTML
        //tod: inline entry, entry, asset
        return documentToHtmlString(fieldValue)
      case 'Object':
        return JSON.stringify(fieldValue)
      case 'Array':
        return await this.renderArray(field, fieldValue)
      default:
        return 'Not properly defined'
    }
  }

  async renderArray(field: string, array: any[]): Promise<string> {
    if (Array.isArray(array) && this.props.sdk.entry.fields[field].items?.type === 'Link') {
      let helper: any = Object.values(array)
      let linkType = this.props.sdk.entry.fields[field].items?.linkType
      let linkComponents: any[] = []

      for (let j = 0; j < helper.length; j++) {
        linkComponents.push(await this.renderLinkAsHTMLComponent(helper[j], linkType))
      }

      return linkComponents.join('<br />')
    }
    return array.join(', ')
  }

  async renderLinkAsHTMLComponent(link: LinkProps, linkType?: string): Promise<string> {
    let data: EntryOrAsset = {}
    if (link.sys.linkType === 'Entry') {
      data.entry = await this.getEntry(link)
    } else if (link.sys.linkType === 'Asset') {
      data.asset = await this.getAsset(link)
    }
    let component = <LinkWrapper id={link.sys.id} linkType={linkType} data={data} sdk={this.props.sdk} />
    return ReactDOMServer.renderToStaticMarkup(component)
  }

  async getEntry(link: LinkProps): Promise<EntryState> {
    let entry: Entry = await this.props.sdk.space.getEntry(link.sys.id)
    let contentType: ContentType = await this.props.sdk.space.getContentType(entry.sys.contentType.sys.id)
    let displayField = contentType.displayField

    return {entry, contentType, displayField}
  }

  async getAsset(link: LinkProps): Promise<Asset> {
    return await this.props.sdk.space.getAsset(link.sys.id)
  }

  setContainer = (keyName: string, i: number) => {
    return (
      <div className='container' id={'mydiv' + i.toString()} key={i}>
        <div className='containerItem' id={'mydiv' + i + 'header'}></div>
        <div className='fieldName'>{this.props.sdk.entry.fields[keyName].id}
        <div className='toggleElment' id={'mydiv' + i + 'toggl'} onClick={() => this.toggleElement(i)}>x</div></div>
      </div>
    )
  }

  dragElement = (elmnt: HTMLElement) => {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0

    let dragMouseDown = (e: any) => {
      e = e || window.event
      e.preventDefault()
      // get the mouse cursor position at startup:
      pos3 = e.clientX
      pos4 = e.clientY
      document.onmouseup = closeDragElement
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag
    }

    if (document.getElementById(elmnt.id + "header")) {
      // if present, the header is where you move the DIV from:
      document.getElementById(elmnt.id + "header")!.onmousedown = dragMouseDown
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      elmnt.onmousedown = dragMouseDown
    }


    let elementDrag = (e: any) => {
      e = e || window.event
      e.preventDefault()
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX
      pos2 = pos4 - e.clientY
      pos3 = e.clientX
      pos4 = e.clientY
      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px"
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px"
    }

    let closeDragElement = () => {
      // stop moving when mouse button is released:
      document.onmouseup = null
      document.onmousemove = null
    }
  }

  toggleElement = (el: Number) => {
    // get the elements we want to toggle
    var x = document.getElementById("mydiv"+el)
    var y = document.getElementById("dot"+el)
    var z = document.getElementById("helpText")

    // ensure they are actually there
    if (x !== null && y !== null) {

      //if there are on the page, make it invisibl, pointer to red
      if (x.style.display === "block") {
        x.style.display = "none"
        y.style.background = "red"
        if(z !== null) {z.style.display = "block"}
      } else { //show block, pointer to green
        x.style.display = "block"
        y.style.background = "#AAFF00"
        if(z !== null) {z.style.display = "none"}
      }
    }
  }

  render() {
    return     (
      <Workbench>
      <Workbench.Sidebar position="left">
      <HelpText>Toggle field visibility</HelpText>
      {
        Object.keys(this.props.sdk.entry.fields).map((keyName, i) => (
          <li className="contentTypes" id={'li' + this.props.sdk.entry.fields[keyName].id} key={'li' + this.props.sdk.entry.fields[keyName].id}>
            <Button className="btnToggle" size="small" onClick={() => this.toggleElement(i)}>{keyName}<span className="dot" id={'dot' + i}></span></Button>
          </li>
        ))
      }


      </Workbench.Sidebar>
      <Workbench.Header
      actions={
        <Select name="optionSelect" id="optionSelect" width="medium">
          <Option value="" disabled>Select a predefined size...</Option>
          <Option value="optionOne">Mobile</Option>
          <Option value="optionTwo">Tablet</Option>
          <Option value="optionThree">Desktop</Option>
        </Select>
      }
      />
      <Workbench.Content>
      <Typography>
        {
          Object.keys(this.props.sdk.entry.fields).map((keyName, i) => this.setContainer(keyName, i))
        }
      </Typography>
      </Workbench.Content>
      </Workbench>
    )
  }
}
