CKEDITOR.plugins.add( 'annotation', {
    init: function( editor ) {
        editor.addCommand( 'annotation', {
        	exec: function(editor) {
                var sel = editor.getSelection(),
                ranges = sel.getRanges(),
                selectionIsEmpty = sel.getType() == CKEDITOR.SELECTION_NONE || ( ranges.length == 1 && ranges[ 0 ].collapsed );
                if(!selectionIsEmpty) {
                    var ourStyle = new CKEDITOR.style({
                        element: 'span', 
                        attributes: {
                            'class': '$${NEW_COMMENT_ID_HERE}',
                            'data-type': 'comments'
                        }
                    });
        		    editor.applyStyle(ourStyle);
                }

                //Find annotation button and perform a custom click on it
                var annotation = document.getElementById("workflow-annotation");
                if(annotation) {
                    annotation.click();
                }
        	}
        });

        editor.ui.addButton( 'Annotation', {
            label: 'Add Comment',
            command: 'annotation',
            icon: this.path + 'annotation.png'
        });

        if(editor.contextMenu) {
            editor.addMenuGroup('annoteGroup');
            editor.addMenuItem('annoteItem', {
                label: 'Add Comment',
                icon: this.path+'annotation.png',
                command: 'annotation',
                group: 'annoteGroup'
            });

            editor.contextMenu.addListener(function() {
                return {annoteItem: CKEDITOR.TRISTATE_OFF};
            });
        }
    }
});
