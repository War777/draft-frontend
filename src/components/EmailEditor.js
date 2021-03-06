import React from 'react';
import { Component } from 'react';
import '../RichEditor.css';
import {Editor, EditorState, RichUtils, getDefaultKeyBinding, convertToRaw} from 'draft-js';
import draftToHtml from 'draftjs-to-html';

const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }
  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }
    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

const BLOCK_TYPES = [
  {label: 'H1', style: 'header-one'},
  {label: 'H2', style: 'header-two'},
  {label: 'H3', style: 'header-three'},
  {label: 'H4', style: 'header-four'},
  {label: 'H5', style: 'header-five'},
  {label: 'H6', style: 'header-six'},
  {label: 'Blockquote', style: 'blockquote'},
  {label: 'UL', style: 'unordered-list-item'},
  {label: 'OL', style: 'ordered-list-item'},
  {label: 'Code Block', style: 'code-block'},
];

const BlockStyleControls = (props) => {
  const {editorState} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();
  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

var INLINE_STYLES = [
  {label: 'Bold', style: 'BOLD'},
  {label: 'Italic', style: 'ITALIC'},
  {label: 'Underline', style: 'UNDERLINE'},
  {label: 'Monospace', style: 'CODE'},
];
const InlineStyleControls = (props) => {
  const currentStyle = props.editorState.getCurrentInlineStyle();
  
  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map((type) =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

class EmailEditor extends Component {
  constructor() {
    super();
    this.state = {
      editorState: EditorState.createEmpty(),
      subject: '',
    }
    this.onChange = (editorState) => this.setState({editorState});
    this.focus = () => this.refs.editor.focus();
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.mapKeyToEditorCommand = this._mapKeyToEditorCommand.bind(this);
    this.toggleBlockType = this._toggleBlockType.bind(this);
    this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
    this.sendMail = this.sendMail.bind(this);
    this.handleOnChangeValue = this.handleOnChangeValue.bind(this);
  }

  handleOnChangeValue(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  sendMail() {
    let subject = this.state.subject;
    let blocks = convertToRaw(this.state.editorState.getCurrentContent());
    let body = draftToHtml(
      blocks, 
      {
        trigger: '#',
        separator: ' ',
      }, 
      true, 
    );
    let url = 'http://167.99.236.30/draft-backend/public/api/sendEmail';
    let user_id = localStorage.getItem('user_id');
    let api_token = localStorage.getItem('api_token');
    if (!body || !subject) {
      alert('Please define the subject and the email body');
      return null;
    }
    fetch(url, {
      method: 'post',
        body: JSON.stringify({
          user_id,
          subject,
          body,
        }),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-type': 'application/json',
            'Authorization': `Bearer ${api_token}`,
        }
    })
    .then(res => res.json())
    .then(res => {
      alert('Email sent!');
      this.setState({
        subject: '',
        editorState: EditorState.createEmpty(),
      });
    })
    .catch(err => console.log('error', err));
  }

  _handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _mapKeyToEditorCommand(e) {
    if (e.keyCode === 9 /* TAB */) {
      const newEditorState = RichUtils.onTab(
        e,
        this.state.editorState,
        4, /* maxDepth */
      );
      if (newEditorState !== this.state.editorState) {
        this.onChange(newEditorState);
      }
      return;
    }
    return getDefaultKeyBinding(e);
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  render () {
    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    var contentState = this.state.editorState.getCurrentContent();

    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }

    return (
      <div style={{marginBottom: 30}}>
        <div>
          <h4>Compose</h4>
          <input type="text" name="subject" value={this.state.subject} placeholder="Subject" className="form-control" onChange={this.handleOnChangeValue}/>
        </div>
        <br/>
        <div className="RichEditor-root">
          <BlockStyleControls
            editorState={this.state.editorState}
            onToggle={this.toggleBlockType}
          />
          <InlineStyleControls
            editorState={this.state.editorState}
            onToggle={this.toggleInlineStyle}
          />
          <div className={className} onClick={this.focus}>
            <Editor
              blockStyleFn={getBlockStyle}
              customStyleMap={styleMap}
              editorState={this.state.editorState}
              handleKeyCommand={this.handleKeyCommand}
              keyBindingFn={this.mapKeyToEditorCommand}
              onChange={this.onChange}
              placeholder="Your message here..."
              ref="editor"
              spellCheck={true}
            />
          </div>
        </div>
        <br/>
        <button className="btn btn-outline-primary float-right" onClick={this.sendMail}> Send </button>
      </div>
    );
  }

}

export default EmailEditor;