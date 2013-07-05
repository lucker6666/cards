﻿
(function(Cards, $, ko) {
  var AreaViewModel;
  AreaViewModel = (function() {
    var self;

    self = AreaViewModel.prototype;

    AreaViewModel.prototype.newArea = ko.observable("");

    AreaViewModel.prototype.areas = ko.observableArray([]);

    AreaViewModel.prototype.initAreaControls = function() {
      $("#areas article").on("dragover", function(event) {
        event.preventDefault();
      });
      $("#areas article").on("drop", function(event) {
        var areaElement, areaId, card, cardElement, cardId;
        event.preventDefault();
        cardId = event.originalEvent.dataTransfer.getData("CardID", cardId);
        cardElement = $("*[data-cardid=" + cardId + "]");
        areaElement = $(event.target).closest("#areas article");
        areaId = $(areaElement).data("areaid");
        card = {};
        card.ID = cardId;
        card.AreaID = areaId;
        card.Name = $(cardElement).text();
        $.ajax({
          url: "api/cards/" + card.ID,
          type: "PUT",
          data: card
        }).done(function() {
          var target;
          target = areaElement.find("ul");
          target.append(cardElement);
        }).fail(function() {
          self.showError("Santa can't figured out what happened, can you try it again?");
        });
      });
      $("#areas li").on("dragstart", function(event) {
        var cardId;
        cardId = $(event.target).data("cardid");
        event.originalEvent.dataTransfer.setData("CardID", cardId);
      });
      $("#areas article footer div").hide();
      $("#areas article footer a").on("click", function() {
        var article, articles, currentArea, _fn;
        articles = $("#areas article");
        _fn = function(article) {
          $(article).find("div").hide();
        };
        for (article in articles) {
          _fn(article);
        }
        currentArea = $(this).parent();
        currentArea.find("div").fadeToggle();
        currentArea.find("textarea").focus();
      });
      $("#areas textarea").live("focusout", function(event) {
        $(this).closest("article").find("div").fadeOut();
      });
    };

    AreaViewModel.prototype.refresh = function() {
      $.getJSON("api/areas").done(function(data) {
        self.areas(data);
        self.initAreaControls();
      }).fail(function() {
        self.showError("Santa can't figured out what happened, can you try it again?");
      });
    };

    AreaViewModel.prototype.showError = function(message) {
      $("#error-modal").show();
      $("#error-modal span").text(message);
    };

    AreaViewModel.prototype.addCard = function() {
      var areaId, card, name;
      areaId = this.ID;
      name = $("*[data-areaid=" + areaId + "]").find("textarea").val();
      card = {};
      card.AreaID = areaId;
      card.Name = name;
      $.post("api/cards", card).done(function() {
        self.refresh();
      }).fail(function() {
        self.showError("Santa can't figured out what happened, can you try it again?");
      });
    };

    AreaViewModel.prototype.addArea = function() {
      var area;
      area = {};
      area.Name = self.newArea();
      $.post("api/areas", area).done(function() {
        self.refresh();
      }).fail(function() {
        self.showError("Santa can't figured out what happened, can you try it again?");
      });
      $("#new-area").fadeToggle();
      self.newArea("");
    };

    AreaViewModel.prototype.showArea = function() {
      $("#new-area").fadeToggle();
    };

    AreaViewModel.prototype.init = function() {
      $("#new-area").hide();
      $("#error-modal").hide();
      $("#error-modal").on("click", function(event) {
        $(this).fadeOut();
      });
      $("body").on({
        ajaxStart: function() {
          $("#error-modal").hide();
          $(this).addClass("loading");
        },
        ajaxStop: function() {
          $(this).removeClass("loading");
        }
      });
      self.refresh();
    };

    function AreaViewModel() {
      self.init();
    }

    return AreaViewModel;

  })();
  Cards.ViewModel = AreaViewModel;
})(window.Cards = window.Cards || {}, jQuery, ko);
