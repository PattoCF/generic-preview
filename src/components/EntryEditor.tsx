import React from 'react';
import  ReactDOMServer  from 'react-dom/server';
import { Workbench, Typography, Button, HelpText, Select,Option } from '@contentful/forma-36-react-components';
import { EditorExtensionSDK } from '@contentful/app-sdk';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { Asset } from '@contentful/field-editor-shared';

const { createClient } = require('contentful');
 
interface EditorProps {
  sdk: EditorExtensionSDK,
  id?: string
}

interface ConfigState {
  fields: object,
  entry: any,
  previewClient: any
} 

interface AssetState {
  asset?: Asset
}

class AssetWrapper extends React.Component <EditorProps, AssetState> {
  constructor(props: EditorProps) {
    super(props)

    this.state = {
      asset: undefined
    }
  }

  async componentDidMount() {
    console.log(this.props)
    this.setState({asset: ((this.props.id && await this.props.sdk.space.getAsset(this.props.id || '')) || undefined)})
  }

  asyncrender() {
    debugger
    return ((this.state.asset && (
      <img src={this.state.asset.fields.file[this.props.sdk.locales.default].url} alt={this.state.asset.fields.title[this.props.sdk.locales.default]} />
    )) || <></>)
  }
}

export default class EntryEditor extends React.Component <EditorProps, ConfigState> {
  
  constructor(props: EditorProps){
    super(props)
   
    this.state = {
      fields: props.sdk.entry.fields,
      entry: {},
      previewClient: createClient({
        space: this.props.sdk.ids.space,
        accessToken: 'w1WTNrQoyCxxk5qnFo7FHEcCOBbzXi1SyZmnPOqnVZU',
        host: 'preview.contentful.com'
      }),
    }
  } 
  async componentDidMount() {
    this.state = ({
      //entry : await this.props.sdk.space.getEntries({'sys.id': this.props.sdk.ids.entry, include: 10}),
      entry: await this.state.previewClient.getEntry(this.props.sdk.ids.entry), 
      //previewEntry: await this.props.sdk.space.getEntry(this.props.sdk.ids.entry),
      fields: this.props.sdk.entry.fields,
      previewClient: this.state.previewClient,
    })

    // after the elements are on the page, go ahead and add the content
    try {  
        Object.keys(this.props.sdk.entry.fields).forEach(async (keyName, i) => {
          document.getElementById('mydiv' + i + 'header')!.innerHTML = await this.getFieldValue(this.props.sdk.entry.fields[keyName].id, i)
          this.dragElement(document.getElementById('mydiv' + i.toString())!)
        })
    }catch(err) {
      console.log(err)
    }
  }
    
  async getFieldValue(field: string, i: number) {
    
    let fieldValue = this.props.sdk.entry.fields[field].getValue();  
     // let's not handle these now, we need a case later for all of the field types
    switch(this.props.sdk.entry.fields[field].type) {
      case 'Symbol':  
        //nothing to do here since it is just text
        //or check on widget type here?
       break

      case 'Text': 
        //this needs markdown converter
       break

      case 'Integer': 
        //nothing to do here since it is just integer
       break

      case 'Number': 
        //nothing to do here since it is just integer
        
       break

      case 'Date': 
        //convert the date to a more readable format
        fieldValue = new Date(fieldValue).toISOString().split('T')[0]
       break

      case 'Location': 
       // render the location on a Google Map
       // todo: use different key
        let lat = fieldValue.lat
        let long = fieldValue.lon
        fieldValue = '<img src="https://maps.googleapis.com/maps/api/staticmap?center='
                    + lat + ',' + long + '&zoom=12&size=200x200&markers=color:red%7Clabel:Location%7C'
                    + lat + ',' + long + '&key=AIzaSyDKWGl_R9LCIbyDfjd4HWAJXlA-i40HFLo" />'
      break

      case 'Boolean': 
        fieldValue === true ? fieldValue = 'true' : fieldValue = 'false' 
       break

      case 'Link': 
        switch(fieldValue.sys.linkType) {

          case 'Asset':
            fieldValue = '<img src="' + this.state.entry.fields[field].fields.file.url +' />';
            break

          case 'Entry':
            fieldValue = 'Links to "<a href="https://app.contentful.com/spaces/' + this.props.sdk.ids.space + '/entries/' + fieldValue.sys.id + '" target=_new>'+ this.state.entry.fields[field].fields.title + '</a>" [' + this.props.sdk.ids.contentType + ']';
            break
          
          default: 
        }
        break   
         
      case 'RichText':  
        //convert the Rich Text to HTML
        //tod: inline entry, entry, asset
        fieldValue = documentToHtmlString(fieldValue) 
       break

      case 'Object':  
       fieldValue = JSON.stringify(fieldValue)

       break 

      case 'Array': 
      
        // the type is Array, and we hav a link
        // then it can only be entry or asset
        if(Array.isArray(fieldValue) && this.props.sdk.entry.fields[field].items?.type === 'Link') { 
          switch(this.props.sdk.entry.fields[field].items?.linkType) {
              
              case 'Entry':
                
                let entryHelper: any = Object.values(fieldValue); 
                let helperReturn: String = '' 

                entryHelper.forEach((element: any, i: number) => {
                  helperReturn += '<br />Links to "<a href="https://app.contentful.com/spaces/' + this.props.sdk.ids.space + '/entries/' + element.sys.id + '" target=_new>' + this.state.entry.fields[field][i].fields.title + '</a>" [' + this.props.sdk.ids.contentType + '] <br />' ;
                });
                
                fieldValue = helperReturn
                
                break
              
              //Asset --> getAsset, then show image
              case 'Asset':
                
                let helper: any = Object.values(fieldValue); 

                fieldValue = helper.map((element: any) => {
                  let component = <AssetWrapper id={element.sys.id} sdk={this.props.sdk} />
                  let componentAsString = ReactDOMServer.renderToStaticMarkup(component)
                  debugger
                  return componentAsString
                })
                break
            }
        }

        //case: for a list of items
        if(fieldValue !== undefined && this.props.sdk.entry.fields[field].items && this.props.sdk.entry.fields[field].items?.type !== 'Link') {
          fieldValue = fieldValue.join(', ')
        } 
     break
    
      default: fieldValue = 'Not properly defined'
    } 
    //return the updated value to be rendered on the page
    return fieldValue
  }

  async getAsset() {

  }
  
  setContainer = (keyName: string, i: number) => {
    return (
      <div className='container' id={'mydiv'+i.toString()} key={i}>
        <div className='containerItem' id={'mydiv' + i + 'header'}></div>
        <div className = 'fieldName'>{this.props.sdk.entry.fields[keyName].id} 
        <div className='toggleElment' id={'mydiv' + i + 'toggl'} onClick={() => this.toggleElement(i)}>x</div></div>
      </div>    
    )
  }
 
  dragElement = (elmnt: HTMLElement) => {    
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    let dragMouseDown = (e: any) => {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    if (document.getElementById(elmnt.id + "header")) {
      // if present, the header is where you move the DIV from:
      document.getElementById(elmnt.id + "header")!.onmousedown = dragMouseDown;
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      elmnt.onmousedown = dragMouseDown;
    }

  
    let elementDrag = (e: any) => {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }
  
    let closeDragElement = () => {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
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
        x.style.display = "none";
        y.style.background = "red";
        if(z !== null) {z.style.display = "block"}
      } else { //show block, pointer to green
        x.style.display = "block";
        y.style.background = "#AAFF00";
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
              <li className="contentTypes" id={'li'+this.props.sdk.entry.fields[keyName].id} key={'li'+this.props.sdk.entry.fields[keyName].id}>
                <Button className="btnToggle" size="small"
                  onClick={() => this.toggleElement(i)}
                   > {keyName} <span className="dot" id={'dot'+i}></span> </Button>
              </li>
            ))
          }
            
           
        </Workbench.Sidebar>
        <Workbench.Header
          actions={
            <Select name="optionSelect" id="optionSelect" width="medium">
              <Option value="" disabled>
                Select a predefined size...
              </Option>
              <Option value="optionOne">Mobile</Option>
              <Option value="optionTwo">Tablet</Option>
              <Option value="optionThree">Desktop</Option>
            </Select>
            }
          />
        <Workbench.Content>
          <Typography>
            {
            Object.keys(this.props.sdk.entry.fields).map((keyName, i) => (
              this.setContainer(keyName, i) 
            ))
            }
          </Typography>
        </Workbench.Content>
    </Workbench>
  )
  };
}