$(document).ready(function() {
  $(document).ajaxError(function(event, jqxhr, settings, thrownError) {
    displayAlert("danger", "Oh no! '" + jqxhr.responseJSON.error);
  });
  //use document on to affect elemented added after the DOM loads
  $(document).on("click", "#add_show", function() {
    $("#add_show").prop("disabled", true);
    show = $("#show_name").val();
    $.post("/api/addShowByName", {
      show: show
    })
    .done(function(data) {
      if (data.error) {
        //something went wrong
        displayAlert("warning", "Oh no! " + data.error);
      } else {
        if ($('.collection-row').length === 0) {
          $('#empty_collection').remove();
        }
        show = data.show;
        //add them to the collection
        $newRow = $('<tr class="collection-row" id="show-' + show.global_id + '"></tr>');
        $newNameCol = $('<td class="collection-show-name col-md-11">' + show.name + '</td>');
        $newRemoveCol = $('<td class="collection-show-button col-md-1"></td>');
        $newRemoveBtn = $('<button class="btn btn-default remove_show" data-show="' + show.global_id + '" data-name="' + show.name + '" role="button">Remove</button>');

        $newNameCol.appendTo($newRow);
        $newRemoveBtn.appendTo($newRemoveCol);
        $newRemoveCol.appendTo($newRow);
        $newRow.appendTo("#collection");
        //give the alert
        displayAlert("success", "You've added '" + show.name + "' (" + show.show_id + ") to your <a href='/collection'>collection</a>");

      }
      clearInput();
    })
    .fail(function(data) {
      clearInput();
    });
  });

  $(document).on("click", ".remove_show", function() {
    // console.log("remove clicked");
    $(this).prop("disabled", true);
    show_id = $(this).attr("data-show");
    show_name = $(this).attr("data-name");
    $.post("/api/removeShow", {
      show_id: show_id
    })
    .done(function(data) {
      if (data.error) {
        //something went wrong
        displayAlert("warning", "Oh no! " + data.error);
      } else {
        if (data.status == "OK") {
          // console.log($(this).parent().parent());
          $("#show-" + show_id).remove();
          if ($('.collection-row').length === 0) {
            $('<tr id="empty_collection"><td class="col-md-12" colspan="2"><i>You have no shows in your collection.</i></td></tr>').appendTo('#collection');
          }
          //give the alert
          displayAlert("success", "You've removed '" + show_name + "' (" + show_id + ") from your <a href='/collection'>collection</a>");
        }
      }
    });
  });
});

function clearInput() {
  $("#add_show").prop("disabled", false);
  $("#show_name").val("");
}
$(document).ready(function() {
  // Mark individual episode as watched
  $(".acquire-episode").click(function() {
    var provider = $(this).attr('data-provider');
    var episode = $(this).attr('data-id');
    var ep_name = $(this).attr('data-ep-name');
    var $button = $(this);
    $.get("/api/findShowURLs", {
      provider: provider,
      episode: episode,
      ep_name: ep_name
    })
    .done(function(data) {
      if (data.error) {
        //something went wrong
        console.log(data.error);
      }
      console.log(data.results.suggestions);
      if (data.results.suggestions.length != 0){
        //there's at least one show to download
        var suggestions = [];
        suggestions.push(formatResult(data.results.suggestions[0], 0));
        $button.parent().html(suggestions.join("<br>"));
        suggestions += "<p>" + data.results.results.length + " more results</p>";
      }else{
        $button.parent().html("No results found");
      }
    });
  });
});

function formatResult (result){
  var htmlResult = "<a href=\"" + result.link + "\" target='_blank'>" + decodeURI(result.name) + "</a>";
  htmlResult += "<div class='result-div'>";
  htmlResult += formatMetaPrices(result);
  htmlResult += formatMetaSize(result);
  htmlResult += formatMetaLanguages(result);
  htmlResult += formatMetaQuality(result);
  htmlResult += "</div>";
  return htmlResult;
}

function formatMetaPrices (result){
  //for formatting meta prices
  var htmlResult = "";
  if (typeof result.meta.prices != 'undefined'){
    htmlResult += "<ul class='result-meta-prices'>";
    if (typeof result.meta.prices.sd != 'undefined'){
      htmlResult += "<li><span class='badge'>SD</span> $" + result.meta.prices.sd + "</li>";
    }
    if (typeof result.meta.prices.hd != 'undefined'){
      htmlResult += "<li><span class='badge'>HD</span> $" + result.meta.prices.hd + "</li>";
    }
    htmlResult += "</ul>";
  }
  return htmlResult;
}

function formatMetaSize (result){
  //for formatting file sizes
  var htmlResult = "";
  if (result.meta.size){
    htmlResult += "<p>" + result.meta.size + "</p>";
  }
  return htmlResult;
}

function formatMetaLanguages (result){
  //for formatting an array of languages
  var htmlResult = "";
  if (result.meta.languages){
    if (result.meta.languages.length > 0){
      htmlResult += "<p>" + result.meta.languages.join(", ") + "</p>";
    }else{
      htmlResult += "<p>No Language Information Provided</p>";
    }
  }
  return htmlResult;
}

function formatMetaQuality (result){
  //for formatting the quality (res) of a video
  var htmlResult = "";
  if (result.meta.quality){
    htmlResult += "<p>Quality: <span class='badge'>" + result.meta.quality + "</span></p>"
  }
  return htmlResult;
}

$(document).ready(function() {
  var mod_date = $(".show-mod-date").html();
  var last_update = moment(mod_date).fromNow();
  $(".show-mod-date").html(last_update);
  $(".show-mod-date").css("visibility", "visible");
});

function displayAlert(type, message){
  alert = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">';
  alert += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + message + '</div>';
  $("#alert-container").html(alert);
}

$(document).ready(function() {
  // Mark individual episode as watched
  $(".collection-watch").change(function() {
    show_id = $("#show_id").val();
    episode_number = $(this).attr('data-episode');
    $.post("/api/toggleWatch", {
      show_id: show_id,
      episode_number: episode_number
    })
    .done(function(data) {
      if (data.error) {
        //something went wrong
        console.log(data.error);
      }
      if (data.watched === 1) {
        $(this).prop("checked", true);
        $("#episode-" + data.episode_number).addClass("info");
      } else {
        $(this).prop("checked", false);
        $("#episode-" + data.episode_number).removeClass("info");
      }
    });
  });

  // Mark all episodes of a season as watched
  $(".collection-season-watch").click(function() {
    show_id = $("#show_id").val();
    season_number = $(this).attr('data-season');
    var episodeArr = [];
    //get an arr of the episodes in this season
    $(".season-" + season_number).each(function(index) {
      if ($(this).prop("disabled") != true){
        episodeArr.push($(this).attr('data-episode'));
      }
    });
    $.post("/api/toggleWatch", {
      show_id: show_id,
      episode_number: episodeArr
    })
    .done(function(data) {
      if (data.error) {
        //something went wrong
        console.log(data.error);
      }
      if (data.watched === 1) {
        $(".season-" + season_number).each(function(index) {
          if ($(this).prop("disabled") != true){
            $(this).prop("checked", true);
          }
        });
        while (episodeArr.length > 0) {
          $("#episode-" + episodeArr.pop()).addClass("info");
        }
      }
    });
  });

  // Mark all episodes of a show as watched
  $(".collection-show-watch").click(function() {
    var show_id = $("#show_id").val();
    var season_count = parseInt($("#season_count").text());
    var episodeArr = [];

    var current_season = "";
    for (var i = 1; i <= season_count; i++) {
      i < 10 ? current_season = ".season-0" + i : current_season = ".season-" + i;
      $(current_season).each(function(index) {
        if ($(this).prop("disabled") != true){
          //this episode is in the future and shouldn't be watched
          episodeArr.push($(this).attr('data-episode'));
        }
      });
    }

    $.post("/api/toggleWatch", {
      show_id: show_id,
      episode_number: episodeArr
    })
    .done(function(data) {
      if (data.error) {
        //something went wrong
        console.log(data.error);
      }
      if (data.watched === 1) {
        $(current_season).each(function(index) {
          if ($(this).prop("disabled") != true){
            $(this).prop("checked", true);
          }
        });
        while (episodeArr.length > 0) {
          $("#episode-" + episodeArr.pop()).addClass("info");
        }
      }
    });
  });

  $(".flush-cache").click(function() {
    var id = $(this).attr('data-id');
    var db = $(this).attr('data-db');
    var plugin = $(this).attr('data-plugin');
    $.post("/api/flushCache", {
      id: id,
      db: db,
      plugin: plugin
    })
    .done(function(data) {
      console.log(data);
      if (data.error) {
        //something went wrong
        console.log(data.error);
      }
      if (data.removed == true) {
        console.log("removing");
        $(".flush-cache").parent().find(".show-mod-date").html("just now!");
      }
    });
  });
});
