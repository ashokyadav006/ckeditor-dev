CKEDITOR.plugins.add('wittyanchor', {
    requires: 'widget',
    init: function (editor) {
        var pluginName = 'wittyanchor';

        editor.widgets.add(pluginName, {
            defaults: {
                content: '',
                referenceId: '',
                canEdit: false
            },
            editables: {
                content: {
                    selector: '.reference-editable'
                }
            },
            data: function() {
                this.element.setText(this.data.content);
                this.element.setAttribute('reference-id', this.data.referenceId);
                if(this.data.canEdit) {
                    this.element.addClass('reference-editable');
                    if(!this.element.getAttribute('contenteditable')) {
                        this.wrapper.setAttribute('contenteditable', true);
                        this.initEditable('content', {selector: '.reference-editable'});
                    }
                }
            },
            template:
                '<span class="witty-anchor-reference"></span>',
            init: function() {
                var widget = this;
                if(editor.getSelection()) {
                    var seletedText = editor.getSelection().getSelectedText();
                    this.setData('content', seletedText);
                }

                widget.on( 'doubleclick', function( evt ) {
                    evt.cancel();
                    var referenceId = widget.data.referenceId;
                    var injector = angular.element(document).injector();

                    //Get the angular injector to invoke dialog factory to open 
                    //our custom dialog
                    injector.invoke(['dialogFactory','witReferenceFactory', 'anchorService',
                        function(dialogFactory, witReferenceFactory, anchorService) {
                            var anchor = witReferenceFactory.getWitAnchor(referenceId);
                            if(anchor) {
                                showPDFViewer();
                            } else {
                                anchorService.getAnchorDetails(referenceId)
                                    .then(function(witAnchor) {
                                        if(witAnchor) {
                                            anchor = witAnchor;
                                            showPDFViewer();
                                        }
                                    });
                            }


                            function showPDFViewer() {
                                dialogFactory.showPdfViewer({
                                    filePath: '/api/wittyparrot/api/anchorlinks/previewfile/'+anchor.id,
                                    anchors: anchor.coordinates     
                                });
                            }
                    }]);

                }, null, null, 5 );
            },
            focus: function() {
                //This event has no purpose but it's helping in not focusing widget
                //after widget creation, which helps in case we want to create more than
                //one widget
            },
            upcast: function(element, data) {
                var shouldUpcast = false;
                if(element.name === 'span' && element.hasClass('witty-anchor-reference')) {
                    shouldUpcast = true;
                    data.content = element.getHtml();
                    var attributes = element.attributes;

                    data.referenceId = attributes['reference-id'];
                    if(element.hasClass('reference-editable')) {
                        data.canEdit = true;
                    }
                }
                return shouldUpcast;
            },
            edit: function(evt) {
                evt.cancel();
                var widget = this;

                var injector = angular.element(document).injector();

                //Get the angular injector to invoke dialog factory to open 
                //our custom dialog
                injector.invoke(['dialogFactory', 'witReferenceFactory','$stateParams', 'appPopupFactory',
                    function(dialogFactory, witReferenceFactory,$stateParams, appPopupFactory) {
                        var witId = $stateParams.witId || $stateParams.id;
                        if(!witId) {
                            appPopupFactory.showSimpleToast('Please save wit first to add anchors');
                            return;
                        }

                        dialogFactory.showAnchorListDialog({
                            createAnchor: function(type, anchor) {
                                if(type === 'CONTENT_COPY') {
                                    copyContent(anchor);
                                } else if(type === 'CONTENT_REFERENCE') {
                                    widget.setData('content', anchor.content);
                                    referContent(anchor);
                                    associateAnchorToWit(anchor);
                                } else if(type === 'SELECTION_REFERENCE') {
                                    widget.setData('canEdit', true);
                                    referContent(anchor);
                                    associateAnchorToWit(anchor);
                                }
                            }
                        });

                        function associateAnchorToWit(anchor) {
                            var content = editor.getData();
                            witReferenceFactory.addWitAnchor(anchor, content);
                        }

                        function copyContent(anchor) {
                            editor.insertText(anchor.content);
                        }

                        function referContent(anchor) {
                            widget.setData('referenceId', anchor.id);

                            editor.fire('saveSnapshot');

                            // Cache the container, because widget may be destroyed while saving data,
                            // if this process will require some deep transformations.
                            var container = widget.wrapper.getParent(true);
                            
                            // Widget will be retrieved from container and inserted into editor.
                            editor.widgets.finalizeCreation( container );
                            widget.data.isWidget = true;

                            editor.fire('saveSnapshot');
                            
                        }
                }]);
            }
        });

        editor.ui.addButton('WittyAnchor', {
            label: 'Add Anchor',
            command: pluginName,
            icon: this.path + 'wittyanchor.png'
        });
    }
});
