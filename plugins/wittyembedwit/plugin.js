CKEDITOR.plugins.add('wittyembedwit', {
    requires: 'widget',
    init: function(editor) {
        'use strict';
        var pluginName = 'wittyembedwit';
        var widget;

        editor.widgets.add(pluginName, {
            defaults: {
                embedId: ''
            },
            data: function() {
                addWitPreview({
                    id: this.data.embedId
                });
            },
            upcast: function(element, data) {
                if (element.name === 'div' && element.attributes['embed-wit-id']) {
                    data.embedId = element.attributes['embed-wit-id'];
                    //For doc wit setting html as empty since it will contains public url of
                    //attachment
                    if (element.attributes['wit-type'] === 'DOC_WIT') {
                        var witlink = element.getFirst();
                        if (witlink) {
                            //We have got the public url of the attachment
                            data.witlinkUrl = witlink.attributes['href'];
                        }

                        element.setHtml('<br>');
                    }
                    return true;
                }
            },
            init: function() {
                widget = this;
            }
        });

        editor.addFeature(editor.widgets.registered[pluginName]);

        editor.on('paste', function(event) {
            injector.invoke(['appPopupFactory', 'dialogFactory', 'editorUtil', 'witService',
                'witlinksManagementService', 'combowitService', 'WIT_TYPE',
                function(appPopupFactory, dialogFactory, editorUtil, witService,
                    witlinksManagementService, combowitService, WIT_TYPE) {
                    if (event.data.type === 'text') {
                        var droppedObj, wit;
                        try {
                            droppedObj = JSON.parse(event.data.dataValue);
                        } catch (e) {
                            return;
                        }
                        wit = droppedObj.data;
                        event.data.dataValue = '';

                        if (droppedObj.channel === 'witDrag') { //Dragging wits
                            _onWitDrop(wit);
                        } else if (droppedObj.channel === 'witlinksOfWitDrag') { //Dragging witlinks
                            _onWitlinkDrop(wit);
                        } //End of else-if statement
                    }

                    function _onWitDrop(wit) {
                        if (wit.witType === WIT_TYPE.COMBO) {
                            appPopupFactory.showSimpleToast('You can\'t embed a combo wit');
                            event.cancel();
                        } else if (wit.isEmbeddedWit || wit.embeddedWit) {
                            appPopupFactory.showSimpleToast('You can\'t embed an embedded wit');
                            event.cancel();
                        } else if (wit.status === 'LOCKED_FOR_WORKFLOW') {
                            appPopupFactory.showSimpleToast('You can\'t embed a workflow wit');
                            event.cancel();
                        } else {
                            if (editor.config.dropMode &&
                                editor.config.dropMode === 'plainContent') {
                                performActionForDroppedWit(wit, 'dropAsPlainContent');
                            } else {
                                dialogFactory.showWitDropActionDialog({
                                    targetEvent: null,
                                    onRemoving: function() {
                                        editor.focus();
                                    },
                                    locals: {
                                        dialogData: {
                                            wit: wit,
                                            onConfirmCallback: function onConfirmCallback(actionType) {
                                                performActionForDroppedWit(wit, actionType);
                                            } //End of onConfirmCallback
                                        } //End of dialogData object
                                    } //End of locals
                                });
                            } //End of else statement
                        }
                    }

                    function _onWitlinkDrop(wit) {
                        witlinksManagementService.getPublicWitlink(wit.id)
                            .then(function(response) {
                                insertWitlink(response.hotLinkUrl, wit);
                            });
                    }
                }
            ]);
        });

        var injector = angular.element(document).injector();

        function addWitPreview(wit) {
            //Get the angular injector to invoke dialog factory to open
            //our custom dialog
            injector.invoke(['$timeout', 'witService', 'editorUtil', 'appPopupFactory',
                'witContentPreviewService',
                function($timeout, witService, editorUtil, appPopupFactory, witContentPreviewService) {
                    //We are loading wit
                    var embedWit = editorUtil.embedWitExist(wit.id);
                    if (embedWit) {
                        //If its a doc wit and there is
                        if(embedWit.witType === 'DOC_WIT' &&
                            widget.data.witlinkUrl) {
                            var docFile = embedWit.attachmentDetails  ? embedWit.attachmentDetails[0] :
                                                                        embedWit.attchmentDetailVO[0];
                            //Add public attachment id to the document of doc wit to be used
                            //when user saves the wit, it will be used to generate a public url and
                            //will be added to the content.
                            if(!docFile.witlinkUrl) {
                                docFile.witlinkUrl = widget.data.witlinkUrl;
                            }
                        }

                        generateWitPreview(embedWit, true);
                    }


                    function generateWitPreview(witData, existingWit) {
                        var witContent, compiledHTML;

                        if (witData.isDeleted) {
                            witContent = document.createElement('h1');
                            witContent.style.textAlign = 'center';
                            witContent.style.color = 'red';
                            witContent.innerText = 'THIS WIT IS DELETED';
                        } else {
                            witData.content = witData.content ? witData.content
                                .replace(/<html>|<\/html>|<body>|<\/body>|<head>|<\/head>|<meta><\/meta>/gi, '') : '';
                            compiledHTML = witContentPreviewService.generateContentPreview(witData,
                                witData.isDropped ? false : true);

                            witContent = compiledHTML[0];
                        }
                        var $editor = document.getElementsByTagName('witty-editor')[0];

                        var witContainerWidgets = $editor.querySelectorAll('[embed-wit-id="' + wit.id + '"]'),
                            witContainerWidget, witContainer;

                        for (var i = witContainerWidgets.length - 1; i >= 0; i--) {
                            witContainer = witContainerWidgets[i];
                            if (witContainer.innerHTML === '<br>') {
                                witContainerWidget = witContainer;
                            }
                        }

                        if (witContainerWidget) {
                            witContainerWidget.innerHTML = '';
                            witContainerWidget.appendChild(witContent);
                        }

                        if (!existingWit) {
                            editorUtil.addEmbedWit(wit);
                        }
                    }

                }
            ]);
        }

        function performActionForDroppedWit(wit, actionType) {
            injector.invoke(['editorUtil', 'witService', '$state', 'witRelatedService',
                'appPopupFactory', '$rootScope', 'witlinksManagementService',
                function(editorUtil, witService, $state, witRelatedService, appPopupFactory,
                    $rootScope, witlinksManagementService) {

                    function generateEmbedHtml(wit) {
                        var embedHtml = '<br/><div embed-wit-id=' + wit.id +' class="embed-wit"'+
                                                                        'wit-type="'+wit.witType+'"';

                        if(wit.witType === 'DOC_WIT') {
                            embedHtml += ' doc-attachment='+wit.attachmentDetails[0].fileAssociationId;
                        }

                        embedHtml += ' ></div><br/>';

                        return embedHtml;
                    }

                    function addEmbedWit(witData) {
                        witData.isDropped = true;
                        editorUtil.addEmbedWit(witData);
                        inserHTMLIntoEditor(generateEmbedHtml(witData));
                    }

                    switch (actionType) {
                        case 'dropAsEmbedContent':
                            {
                                var witData = editorUtil.embedWitExist(wit.id);
                                if (witData) {
                                    witData.id = wit.id;
                                    inserHTMLIntoEditor(generateEmbedHtml(witData));
                                } else {
                                    if(wit.witType === 'DOC_WIT') {
                                        var docFile = wit.attachmentDetails[0];

                                        witlinksManagementService.getPublicWitlink(wit.id)
                                            .then(function(response) {
                                                docFile.witlinkUrl = response.hotLinkUrl;
                                                addEmbedWit(wit);
                                            });
                                    } else {
                                        witService.getWit(wit.id)
                                            .then(function(witData) {
                                                addEmbedWit(witData);
                                            });
                                    }
                                }
                                break;
                            }
                        case 'dropAsPlainContent':
                            {
                                $rootScope.$emit('GET_WIT_CONTENT', function(content) {
                                    if (content) {
                                        inserHTMLIntoEditor(content);
                                    } else {
                                        witService.getWit(wit.id)
                                            .then(function(witData) {
                                                inserHTMLIntoEditor(witData.content, witData.acronyms);
                                            });
                                    }
                                });
                                break;
                            }
                        case 'dropAsRelatedWit':
                            {
                                //event.data.dataValue = '';
                                var targetWitId = $state.params.witId;
                                witRelatedService.addRelatedWit(targetWitId, [wit.id])
                                    .then(function(response) {
                                        if (response.error) {
                                            appPopupFactory.showSimpleToast('Updated failed');
                                        } else {
                                            appPopupFactory.showSimpleToast('Related wit added');
                                        }
                                    });
                                break;
                            }
                    } //End of Switch statement
                }
            ]);
        }

        function inserHTMLIntoEditor(contentHTMLStr, acronymList) {
            injector.invoke(['editorUtil',
                function(editorUtil) {
                    var hasAcronym = acronymList !== undefined && acronymList.length > 0,
                        contentToBeInsert = hasAcronym ?
                        editorUtil.getSubstitueContent(contentHTMLStr, acronymList) :
                        contentHTMLStr;
                    editor.insertHtml(contentToBeInsert);
                }
            ]);
        }

        function insertWitlink(witlinkToBeInsert, targetWit) {
            var witlinkHTML = '<a href="' + witlinkToBeInsert + '" target="_blank">' + targetWit.name + '</a>';
            editor.insertHtml(witlinkHTML);
        }
    }
});
