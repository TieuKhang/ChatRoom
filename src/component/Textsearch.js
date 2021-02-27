import AsyncSelect from 'react-select/async';
import React, {Component} from 'react';

class TextSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTag: ['']
        }
    }
  
    loadOptions = async (inputValue) => {
        inputValue = inputValue.toLowerCase().replace(/\W/g, "");
        return new Promise((resolve => {
                this.props.client.collection('messages')
                    .orderBy('text')
                    .startAt(inputValue)
                    .endAt(inputValue + "\uf8ff")
                    .get()
                    .then(docs => {
                        if (!docs.empty) {
                            let recommendedTags = []
                            docs.forEach(function (doc) {
                                const tag = {
                                    value: doc.id,
                                    label: doc.data().text
                                }
                                recommendedTags.push(tag)
                            });
                            return resolve(recommendedTags)
                        } else {
                            return resolve([])
                        }
                    })
  
            })
        )
    }
  
    handleOnChange = (tags) => {
        this.setState({
            selectedTag: [tags]
        })
    }
  
    render() {
        return (
            <div>
                <AsyncSelect
                    loadOptions={this.loadOptions}
                    onChange={this.handleOnChange}
                />
                <span>Selected Tag:
                {
                    this.state.selectedTag.map(e => {
                        return (
                            <span key={e.value}>
                                    {e.label}
                            </span>
                        )
                    })
                }</span>
            </div>
        );
    }
  
}
export default TextSearch;
