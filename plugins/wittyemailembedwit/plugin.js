CKEDITOR.plugins.add('wittyemailembedwit', {
	init: function(editor) {
		var pluginName = 'wittyemailembedwit';
		var injector = angular.element(document).injector();


		editor.on('paste', function(event) {
			injector.invoke(['appPopupFactory', 'WIT_TYPE',
				function(appPopupFactory, WIT_TYPE) {
					if (event.data.type === 'text') {
						var droppedObj, wit;
						try {
							droppedObj = JSON.parse(event.data.dataValue);
						} catch (e) {
							return;
						}
						wit = droppedObj.data;
						event.data.dataValue = '';

						if (droppedObj.channel === 'witDrag') {
							if (wit.witType === WIT_TYPE.DOC) {
								appPopupFactory.showSimpleToast('You can\'t embed a doc wit');
								event.cancel();
							} else {
								if (editor.config.dropMode && editor.config.dropMode === 'plainContent') {
									performActionForDroppedWit(wit, 'dropAsPlainContent');
								}
							}
						} //End of main if statement
						else if (droppedObj.channel === 'witlinksOfWitDrag') { //Dragging witlinks
							insertWitlink(wit);
						}
					}
				}
			]);
		});

		function performActionForDroppedWit(wit, actionType) {
			injector.invoke(['editorUtil', 'witService', '$state', 'witRelatedService',
				'appPopupFactory', '$rootScope', 'WIT_TYPE', 'combowitService',
				function(editorUtil, witService, $state, witRelatedService, appPopupFactory,
					$rootScope, WIT_TYPE, combowitService) {
					switch (actionType) {
						case 'dropAsPlainContent':
							{
								$rootScope.$emit('GET_WIT_CONTENT', function(content) {
									if (content) {
										//editor.insertHtml(content);
										inserHTMLIntoEditor(content);
									} else {
										witService.getWit(wit.id).then(function(witData) {
											if (witData.witType === WIT_TYPE.COMBO) {
												combowitService.getComboWit(witData)
													.then(function onSuccess(witResponse) {
														inserHTMLIntoEditor(witResponse.content, witResponse.acronyms);
													});
											} else {
												inserHTMLIntoEditor(witData.content, witData.acronyms);
											}
										}); //End of getWit API call
									}
								});
								break;
							} //End of dropAsPlainContent case
					} //End of Switch statement
				}
			]);
		} //End of performActionForDroppedWit


		function insertWitlink(wit) {
			injector.invoke(['witlinksManagementService',
				function(witlinksManagementService) {
					witlinksManagementService.getPublicWitlink(wit.id)
						.then(function(response) {
							insertWitlinkIntoEditor(response.hotLinkUrl, wit);
						});
				}
			]);
		}

		function insertWitlinkIntoEditor(witlinkToBeInsert, targetWit) {
			var witlinkHTML = '<a href="' + witlinkToBeInsert + '" target="_blank">' + targetWit.name + '</a>';
			editor.insertHtml(witlinkHTML);
		}

		function inserHTMLIntoEditor(contentHTMLStr, acronymList) {
			injector.invoke(['editorUtil', function(editorUtil) {
				var hasAcronym = acronymList !== undefined && acronymList.length > 0,
					contentToBeInsert = hasAcronym ?
					editorUtil.getSubstitueContent(contentHTMLStr, acronymList) :
					contentHTMLStr;
				editor.insertHtml(contentToBeInsert);
			}]);
		}
	}
});
