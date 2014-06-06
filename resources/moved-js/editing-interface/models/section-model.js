
/*global define */
define(["backbone", "underscore", "jquery", "editing-interface/collections/section-collection"], function (Backbone, _, $, SectionCollection) {

  return Backbone.Model.extend({
    defaults: function () {
      return {
        summary: "",
        startWord: null,
        thumbnail: null
      };
    },

    initialize: function () {
      var thisModel = this,
          startWord = thisModel.get("startWord");
      thisModel.switchStartWordListeners(null, startWord);
    },

    switchStartWordListeners: function (oldWord, newWord) {
      var thisModel = this;

      // USE STATS
      if (oldWord) {
        window.vdstats.nSecMoves.push((new Date()).getTime());
      }

      thisModel.set("startWord", newWord);
      thisModel.listenToOnce(newWord, "change:switchStartWord", thisModel.switchStartWordListeners);
      thisModel.listenTo(newWord, "change:startSection", thisModel.handleSectionChange);
      thisModel.listenTo(newWord, "infocus", thisModel.handleGainFocus);
      if (oldWord) {
        thisModel.stopListening(oldWord);
      }
      window.setTimeout(function () {
        thisModel.handleGainFocus();
      }, 200);
    },

    handleSectionChange: function () {
      var thisModel = this;
      thisModel.destroy();
    },

    handleGainFocus: function () {
      var thisModel = this;
      thisModel.trigger("gainfocus");
    },

    getStartTime: function () {
      return this.get("startWord").get("start");
    },

    getEndTime: function () {
      var nexSS = this.get("startWord").getNextSectionStart(false);
      return (nexSS && nexSS.get("start")) || window.Infinity;
    }
  });
});