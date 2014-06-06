
/*global define */
define(["backbone", "underscore", "jquery", "editing-interface/collections/chapter-collection", "editing-interface/models/chapter-model"], function (Backbone, _, $, ChapterCollection, ChapterModel) {

  return Backbone.Model.extend({
    defaults: function () {
      return {
        title: "",
        author: "",
        chapters: new ChapterCollection()
      };
    },

    initialize: function () {
        var thisModel = this;
        thisModel.listenTo(thisModel.get("chapters"), "remove", function (chp) {
          // move section of the chapter to the preceding chapter if it exists
          console.log("remove chapter from digest model");

          // make sure we have remaining sections
          if (chp.get("sections").length == 0) {
            return;
          }

          // move the remaining sections
          var chpStartTime = chp.get("sections").models[0].get("startWord").get("start"),
              closestChapter,
              curMin = Infinity;
          thisModel.get("chapters").each(function (ochap) {
            var cstime = ochap.get("sections").models[0].get("startWord").get("start"),
                tDiff = chpStartTime - cstime;

            if (tDiff > 0 && tDiff < curMin ) {
              curMin = tDiff;
              closestChapter = ochap;
            }
          });
          if (closestChapter) {
            closestChapter.get("sections").add(chp.get("sections").models);
          } else {
            console.log("chapter removed with no preceeding chapter");
          }
        });
    }

  });
});