import React from 'react';
import Parser from 'html-react-parser';
var showdown  = require('showdown'), converter = new showdown.Converter();

/* REACT COMPONENT DOC BLOCK

# Codex

## INHERITED PROPERTIES
entity:						The current entity (or null)
codexStack:					Stack of recently opened codex entities

## CALCULATED PROPERTIES
n/a

## STATES
n/a

## INHERITED CRITICAL METHODS
void openCodex:				Open an event in the codex
void closeCodex:			Close the codex
void setCodexStack:			Set codex stack to desired index

## COMPONENT CRITICAL METHODS
JSX buildEntityJSX(entity):	Return JSX composed of rendering the entity data


Author:	June McIntyre
Date:	June 27 2018
*/

class Codex extends React.Component {
	render() {
		// Two rendering paths - if there IS entites opened, or if there isn't
		if (this.props.entity !== null) {	// If there is something
			var entity = this.buildEntityJSX(this.props.entity, this.props.codexStack);
			return (
				<div className="hystori__codex hystori-codex hystori__codex--open hystori-codex--open">
					<span className="hystori-codex__close" onClick={() => this.props.closeCodex()}>&times;</span>
					<div className="hystori-codex__stack codex-stack">
						
					</div>
					<div className="hystori-codex__description codex-description">
						{entity}
					</div>
				</div>
			);
		} else {							// Empty codex
			return (
				<div className="hystori__codex hystori-codex hystori__codex--closed hystori-codex--closed"></div>
			);
		}
	}

	/* Build JSX for entity function */
	// Pass an entity object and return corresponding JSX fragment
	buildEntityJSX(entity, codexStack) {
		var desc = converter.makeHtml(entity.description);
		desc = Parser(desc, {		// Generate the description from MarkDown
			replace: domNode => {	// Replace the <span key=...> stuff with actual React onclick functions
				if (domNode.attribs !== undefined && domNode.attribs.type !== undefined && domNode.attribs.type === 'link') {
					var newEntity = this.props.getEntity(domNode.attribs.key);
					return (<span className="codex-description__link" onClick={() => this.props.openCodex(newEntity.key)}>{domNode.children[0].data}</span>);
				}
			}
		});

		// Build list of of keys based on stack (bottom to top)
		var crumbs = codexStack.map((cs, index) => {
			return (
				<React.Fragment key={index}>
					<span key={index} className="codex-description__crumb" 
					onClick={() => this.props.setCodexStack(index)}
					>{cs.key}</span>
					<i className="fas fa-angle-right codex-description__arrow"></i>
				</React.Fragment>
			);
		});

		crumbs.push(<span key={codexStack.length} className="codex-description__selected-crumb">{entity.key}</span>);

		return (
			<React.Fragment>
				<p className="codex-description__title codex-title"><img alt="fleur de lys" src="/fleur-blue.svg" className="codex-title__logo"/>{entity.name}</p>
				<p className="codex-description__key">{crumbs}</p>
				<div className="codex-description__content">{desc}</div>
			</React.Fragment>
		);
	}
}


export default Codex;