import React from 'react';
import { Workbench, Typography, Paragraph, Select, Option, Button } from '@contentful/forma-36-react-components';
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
      fields: props.sdk.entry.fields,
    }

  } 
  async componentDidMount() {
    
    // after the elements are on the page, go ahead and add the content
    try {
        Object.keys(this.props.sdk.entry.fields).map((keyName, i) => (
        document.getElementById('mydiv' + i + 'header')!.innerHTML = this.getFieldValue(this.props.sdk.entry.fields[keyName].id, i),// 'mydiv' + i + 'header'),
        this.dragElement(document.getElementById('mydiv'+i.toString())!)
 
        ))
    }catch(err) {
      console.log(err)
    }
  }

  // should probably be renamed to create or setContainerContent
  async getEntry(entryID: string) {
    //this.setState({selectedContentType: selectedContentType.value})
     const entry = await this.props.sdk.space.getEntry(entryID)
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
    debugger
    var x = document.getElementById("mydiv"+el)
    var y = document.getElementById("dot"+el)
    if (x !== null && y !== null) {
      if (x.style.display === "block") {
        x.style.display = "none";
        y.style.background = "red";
      } else {
        x.style.display = "block";
        y.style.background = "#AAFF00";

      }
    }
  }
  
  getFieldValue = (field: string, i: number) => {
    
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
       // render the location (ideally in a map, but needs API key)
      debugger;
      let lat = fieldValue.lat
      let long = fieldValue.lon
       
      fieldValue = '<img src="https://maps.google.com/maps/api/staticmap?center='+ lat + ','+ long +' '+ '&zoom=14&size=200x200&sensor=true&markers=|&key=AIzaSyDKWGl_R9LCIbyDfjd4HWAJXlA-i40HFLo" style="width: 400px; height: 400px;" />'

       break

      case 'Boolean': 
        //converting bool to 1 or 0
        //todo: other options? 
        fieldValue === true ? fieldValue = 1 : fieldValue = 0 
       break

      case 'Link': 
        
      // need to resolve entry
        if(fieldValue !== undefined) {
          fieldValue = JSON.stringify(fieldValue)
        }
        //main work here for
        // - images
        // - single references
        // - multiple references
       break

      case 'RichText':  
        //convert the Rich Text to HTML
        //update to handle inline entries
        fieldValue = documentToHtmlString(fieldValue) 
       break

      case 'Object':  
       
       fieldValue = JSON.stringify(fieldValue)

       break 

      case 'Array': 
      
        // the type is Array, and we hav a link
        if(Array.isArray(fieldValue) && this.props.sdk.entry.fields[field].items?.type === 'Link') { 
          fieldValue.forEach(ref => {
            //check for each link type
            switch(ref.sys.linkType) {
              
              //Entry --> getEntry, then play through same scenario? 
              case 'Entry':
                
                fieldValue = JSON.stringify(fieldValue)
                //how do I call async here?
                debugger
                var entry =  this.getEntry(this.props.sdk.entry.fields[field].id)
                
                break
              
              //Asset --> getAsset, then show image
              case 'Asset':
                fieldValue = JSON.stringify(fieldValue)
                break

            }
            //ref.sys.type
          });
        }

        //case: for a list of items
        if(fieldValue !== undefined && this.props.sdk.entry.fields[field].items && this.props.sdk.entry.fields[field].items?.type !== 'Link') {
            
          fieldValue = fieldValue.join(', ')

        } else {
          fieldValue = JSON.stringify(fieldValue)

        }
        
        //fieldValue = 'Array'   
     break
    
      default: fieldValue = 'Not properly defined'
    } 
    //return the updated value to be rendered on the page
    return fieldValue
  }


  render() {
    return     (
      <Workbench>
        <Workbench.Sidebar position="left">
          <Paragraph>Toggle field visibility</Paragraph>
          
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
        {/*<Workbench.Header
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
          />*/}
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