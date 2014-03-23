define("library/x-editor", ["lodash", "jquery", "ace/ace", "library/x-get"], function(_, $, ace, XGet) {

	function XEditorElement($element){
		
		var self = this;
		self.editor = null;
		self.element = $element;
		self.id = $element.attr("id");
		self.executeEventTargets = [];

		var dispatchEvent = function(){
			var text = self.editor.getValue();
			var args = {
				self: self,
				text: text
			};
	    	_.each(self.executeEventTargets, function(executeTarget){
	    		executeTarget(args);
	    	});
		};

		var subscribeEvents = function(){
			self.editor.commands.addCommand({
			    name: "execute",
			    bindKey: {win: "Ctrl-X",  mac: "Command-X"},
			    exec: function(editor) {
			    	dispatchEvent();
			    },
			    readOnly: false
			});
		};

		var createEditor = function(){
			self.editor = ace.edit(self.id);
			self.editor.setTheme("ace/theme/clouds_midnight");
			self.editor.getSession().setMode("ace/mode/javascript");
			self.editor.setReadOnly(false);
			self.editor.setShowPrintMargin(false);
			self.editor.getSession().setTabSize(4);
			self.editor.setHighlightActiveLine(true);
			self.editor.getSession().setUseWrapMode(false);
			console.log("XEditorElement::createEditor for " + self.id);
		};

		self.addListener = function(callback){
			self.executeEventTargets.push(callback);
			console.log("XEditorElement::addListener for " + self.id);
		};

		self.fireEvents = function(){
			var shouldAutoFire = self.element.attr("x-run-onload");
			if (shouldAutoFire == "true")
				dispatchEvent();
		};

		self.render = function(){
			createEditor();
			subscribeEvents();
		};
	}

	function XEditor(selector) {

		var self = this;
		self.editors = [];

		self.addListener = function(callback) {
			_(self.editors).each(function(editor){
				editor.addListener(callback);
			});
		};

		self.render = function(){
			new XGet(selector)
				.forEach(function(xgetElement) {
					var $element = $(xgetElement.element);
					console.log("XEditor::render applying to " + $element.attr("id"))
					var editorElement = new XEditorElement($element);
					editorElement.render();
					self.editors.push(editorElement);
				});
		};

		self.fireEvents = function(){
			_(self.editors).each(function(editor){
				editor.fireEvents();
			});
		};
	}
	return XEditor;
});