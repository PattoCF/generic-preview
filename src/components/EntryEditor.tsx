import React from 'react';
import { Workbench, Typography, CheckboxField, Paragraph } from '@contentful/forma-36-react-components';
import { EditorExtensionSDK } from '@contentful/app-sdk';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';

interface EditorProps {
  sdk: EditorExtensionSDK;
}

interface ConfigState {
  fields: object,
} 

export default class EntryEditor extends React.Component <EditorProps, ConfigState> {
  
  constructor(props: EditorProps){
    super(props)
   
    this.state = {
      fields: props.sdk.entry.fields
    }

  } 
  async componentDidMount() {
    
    try {
      debugger
      Object.keys(this.props.sdk.entry.fields).map((keyName, i) => (
        document.getElementById('mydiv' + i + 'header')!.innerHTML = this.getFieldValue(this.props.sdk.entry.fields[keyName].id, i, 'mydiv' + i + 'header'),
        this.dragElement(document.getElementById('mydiv'+i.toString())!)
        ))
    }catch(err) {
      console.log(err)
    }
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



  getFieldValue = (field: string, i: number, div: String) => {
    
    let fieldValue = this.props.sdk.entry.fields[field].getValue();  
    
     // let's not handle these now, we need a case later for all of the field types
    switch(this.props.sdk.entry.fields[field].type) {
      case 'Symbol': { } break
      case 'Text': {} break
      case 'Integer': {} break
      case 'Number': {} break
      case 'Date': {
        debugger
        //fieldValue = new Date(fieldValue).toISOString().split('T')[0]
      } break
      case 'Location': {} break
      case 'Boolean': { fieldValue === true ? fieldValue = 1 : fieldValue = 0 } break
      case 'Link': {} break
      case 'RichText': { fieldValue = documentToHtmlString(fieldValue) } break
      case 'Object': { fieldValue = 'Object' } break 
      case 'Array': { 
        
        //this should be a list then? 
        //if(typeof fieldValue !== undefined && this.props.sdk.entry.fields[field].items || 'Array') {
        //  fieldValue = fieldValue.toString()
        //}
        fieldValue = 'Array'   
      } break 
      default: fieldValue = 'Not properly defined'
    }
    return fieldValue
  }


  render() {
    return     (
      <Workbench>
        <Workbench.Sidebar position="left">
          <Paragraph>Enable or disable content blocks via chekboxes.</Paragraph>
          {
          
            Object.keys(this.props.sdk.entry.fields).map((keyName, i) => (
           <li id={'li'+this.props.sdk.entry.fields[keyName].id}>
                <CheckboxField 
                  name={this.props.sdk.entry.fields[keyName].id} 
                  id={this.props.sdk.entry.fields[keyName].id} 
                  labelText={this.props.sdk.entry.fields[keyName].id} labelIsLight />
            </li>
                
            ))
            }
        </Workbench.Sidebar>
        <Workbench.Content>
          <Typography>
            {
            Object.keys(this.props.sdk.entry.fields).map((keyName, i) => (
              <div className='container' id={'mydiv'+i.toString()} key={i}>
                <div className='containerItem' id={'mydiv' + i + 'header'}></div>
                <div className = 'fieldName'>{this.props.sdk.entry.fields[keyName].id} </div>
              </div>            
            ))
            }
          </Typography>
        </Workbench.Content>
    </Workbench>
  )
  };
}