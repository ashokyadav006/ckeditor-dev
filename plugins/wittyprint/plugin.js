/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview Print Plugin
 */

CKEDITOR.plugins.add( 'wittyprint', {
	// jscs:disable maximumLineLength
	// jscs:enable maximumLineLength
	icons: 'wittyprint,', // %REMOVE_LINE_CORE%
	hidpi: true, // %REMOVE_LINE_CORE%
	init: function( editor ) {
		// Print plugin isn't available in inline mode yet.
		if ( editor.elementMode == CKEDITOR.ELEMENT_MODE_INLINE )
			return;

		var pluginName = 'wittyprint';

		// Register the command.
		editor.addCommand( pluginName, CKEDITOR.plugins.wittyprint );

		// Register the toolbar button.
		editor.ui.addButton && editor.ui.addButton( 'Wittyprint', {
			label: 'Print',
			command: pluginName,
			toolbar: 'document,50'
		} );
	}
} );

CKEDITOR.plugins.wittyprint = {
	exec: function( editor ) {
		var printFrame = window.frames['witty-print'];
		if(printFrame) {
			printFrame.document.body.innerHTML = editor.getData();
			printFrame.focus();
			printFrame.print();
		}
	},
	canUndo: false,
	readOnly: 1,
	modes: { wysiwyg: 1 }
};
