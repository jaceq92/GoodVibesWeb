﻿$(function () {
    $("#progress_slider").slider(
        {
            value: 0,
            orientation: "horizontal",
            animate: true,
            max: 300,
            step: 0.5,
            change: function (event) {
                if (event.originalEvent) {
                    player.seekTo($("#progress_slider").slider("value"));
                }
            }
        });
});

$(function () {
    $("#volume_slider").slider(
        {
            value: 100,
            orientation: "horizontal",
            animate: true,
            max: 100,
            min: 0,
            step: 1,
            slide: function () {
                var volume = $("#volume_slider").slider("value");
                player.setVolume(volume);
            }
        });
});

$(function () {
    $('#playercontainer').hide();
    $('#fullscreenbutton').hide();
    $('body').hide().fadeIn('slow');

    if (typeof Cookies.get('username') == 'undefined') {
        window.location.replace("../Home/");
        alert('Sign in or register to use GoodVibes');
    }
});

$(function () {
    $('#addsongform').on('submit', function (e) {
        var row = $("#jsGrid .selected-row:first");
        var row2 = $("#jsGrid2 .selected-row:first");
        if (typeof row[0] != "undefined") {
            var rowindex = row[0].rowIndex + 1;
        }
      
        e.preventDefault();
        $.ajax({
            url: "../api/insertsong/" + Cookies.get("username") + "/" + row2[0].firstChild.innerText,
            type: "POST",
            data: $("#addsongform").serialize(),
            dataType: "text",
            success: function (data) {
                $("#jsGrid").jsGrid("loadData").done(function () {
                    $('#myModal').modal('hide');
                });
            },
            error: function (data) {
            }
        });
    });
});

$(function () {
    $('#addplaylistform').on('submit', function (e) {
        var row = $("#jsGrid2.selected-row:first");
        if (typeof row[0] != "undefined") {
            var rowindex = row[0].rowIndex + 1;
        }


        e.preventDefault();
        $.ajax({
            url: "../api/insertplaylist/" + Cookies.get("username"),
            type: "POST",
            data: $("#addplaylistform").serialize(),
            dataType: "text",
            success: function (data) {
                $("#jsGrid2").jsGrid("loadData").done(function () {
                    $('#playlistModal').modal('hide');
                    var rows = $("#jsGrid2.jsgrid-row, #jsGrid2.jsgrid-alt-row")
                    rows[rowindex].className += ' selected-row';
                });
            },
            error: function (data) {
            }
        });
    });
});

function logout()
{
    $.when(Cookies.remove('username', { path: '/', domain: 'goodvibesweb.azurewebsites.net' })).then(function () {
        window.location.replace("../Home/");    });        
}


function gofullscreen() {
    var $ = document.querySelector.bind(document);
    var playerElement = $('#player');
    var requestFullScreen = playerElement.requestFullScreen || playerElement.mozRequestFullScreen || playerElement.webkitRequestFullScreen;
    if (requestFullScreen) {
        requestFullScreen.bind(playerElement)();
    }
}

function togglemute() {
    if (player.isMuted()) {
        player.unMute();
        $('#togglemute').removeClass('glyphicon glyphicon-volume-off').addClass('glyphicon glyphicon-volume-up');
        $("#volume_slider").slider("option", "value", player.getVolume());
    }
    else {
        player.mute();
        $('#togglemute').removeClass('glyphicon glyphicon-volume-up').addClass('glyphicon glyphicon-volume-off');
        $("#volume_slider").slider("option", "value", 0);
    }
}

function playprevioussong() {
    var row = $("#jsGrid .selected-row:first");
    $("#jsGrid tr").removeClass("selected-row")
    row[0].previousSibling.className += ' selected-row';
    player.loadVideoById(row[0].previousSibling.firstChild.innerText, 0, 'large');
}

function playnextsong() {
    var row = $("#jsGrid .selected-row:first");
    $("#jsGrid tr").removeClass("selected-row")
    row[0].nextSibling.className += ' selected-row';
    player.loadVideoById(row[0].nextSibling.firstChild.innerText, 0, 'large');
}

function toggleplay() {
    var state = player.getPlayerState();
    if (state == '1') {
        player.pauseVideo();
    }
    else
        player.playVideo();
}

function hideplayer() {
    var row = $("#jsGrid .selected-row:first");
    var row2 = $("#jsGrid2 .selected-row:first");

    var rowindex = row[0].rowIndex;
    var rowindex2 = row2[0].rowIndex;


    if ($('#playercontainer').is(':hidden')) {
        $("#jsgridcontainer2").animate({
            opacity: 1.00,
            width: "20.0%"
        }, 500, function () {
            $("#jsgridcontainer").animate({
                opacity: 1.00,
                width: "42%"
            }, 500, function () {
                $("#jsGrid").jsGrid("refresh");
                $("#jsGrid2").jsGrid("refresh");

                var rows = $("#jsGrid").find('.jsgrid-row, .jsgrid-alt-row');
                var rows2 = $("#jsGrid2").find('.jsgrid-row, .jsgrid-alt-row');

                rows[rowindex].className += ' selected-row';
                rows2[rowindex2].className += ' selected-row';

                $('#fullscreenbutton').fadeIn(500);
                $("#playercontainer").fadeIn(500);
            });
        });
    }
    else {
        $("#playercontainer").fadeOut(500, function () {
            $("#jsgridcontainer2").animate({
                opacity: 1.00,
                width: "25.0%"
            }, 500, function () {
                $("#jsgridcontainer").animate({
                    opacity: 1.00,
                    width: "75%"
                }, 500, function () {
                    $('#fullscreenbutton').fadeOut(500);
                    $("#jsGrid").jsGrid("refresh");
                    $("#jsGrid2").jsGrid("refresh");
                    var rows = $("#jsGrid").find('.jsgrid-row, .jsgrid-alt-row');
                    var rows2 = $("#jsGrid2").find('.jsgrid-row, .jsgrid-alt-row');

                    rows[rowindex].className += ' selected-row';
                    rows2[rowindex2].className += ' selected-row';

                });
            });
        });
        }
}


$(function () {
    $("#jsGrid2").jsGrid({
        height: "790px",
        width: "100%",
        sorting: true,
        paging: false,

        autoload: true,
        noDataContent: "Add a playlist",

        rowClick: function (args) {
            var $row = this.rowByItem(args.item);
            if (!$row.hasClass("selected-row")) {
                $("#jsGrid2 tr").removeClass("highlighted-row")
                $row.addClass("highlighted-row");
            }
        },
        rowDoubleClick: function (args) {
            var $row = this.rowByItem(args.item);
            var val = $row["playlist_id"];
            $("#jsGrid2 tr").removeClass("selected-row")
            $("#jsGrid2 tr").removeClass("highlighted-row")
            $row.addClass("selected-row");
            $("#jsGrid").jsGrid("loadData");

        },

        onDataLoaded: function(args) {
            var rows = $("#jsGrid2 .jsgrid-row")
            rows[0].className += ' selected-row';
            $("#jsGrid").jsGrid("loadData");
        },

        controller: {
            loadData: function () {
                var username = Cookies.get("username");
                return $.ajax({
                    type: "GET",
                    url: "../api/getplaylists/" + username,
                    dataType: "json",
                })
            },
        },
        deleteItem: function (item) {
            var row = $("#jsGrid2.selected-row:first");
            if (typeof row[0] != "undefined") {
                var rowindex = row[0].rowIndex - 1;
            }

            return $.ajax({
                url: "../api/deleteplaylist/" + Cookies.get("username") + "/" + item.playlist_id,
                type: "DELETE",
                dataType: "text",
                success: function (data) {
                    $("#jsGrid2").jsGrid("loadData").done(function () {
                        var rows = $("#jsGrid2.jsgrid-row, #jsGrid2.jsgrid-alt-row")
                        rows[rowindex].className += ' selected-row';
                    });

                },
                error: function (data) {
                    alert("Song delete failed");
                }
            });
        },

        fields: [
                 { title: "id", css: "hide", name: "playlist_id", type: "textarea" },
                 { title: "Playlists", name: "playlist_name", align: "left", type: "textarea", width: "90%" },
                 { type: "control", width: "10%", modeSwitchButton: false, editButton: false }
        ]
    });
});

$(function () {
    $("#jsGrid").jsGrid({
        height: "790px",
        width: "100%",
        sorting: true,
        paging: false,

        autoload: true,
        noDataContent: "Add a song and start listening!",
        rowClick: function (args) {
            var $row = this.rowByItem(args.item);
            if (!$row.hasClass("selected-row")) {
                $("#jsGrid tr").removeClass("highlighted-row")
                $row.addClass("highlighted-row");
            }
        },
        rowDoubleClick: function (args) {
            var $row = this.rowByItem(args.item);
            var val = $row["song_url"];
            $("#jsGrid tr").removeClass("selected-row")
            $("#jsGrid tr").removeClass("highlighted-row")
            $row.addClass("selected-row");
            player.loadVideoById(args.item.song_url, 0, 'large');
        },

        controller: {
            loadData: function () {
                var row = $("#jsGrid2 .selected-row:first");

                var username = Cookies.get("username");
                return $.ajax({
                    type: "GET",
                    url: "../api/getplaylist/" + username + "/" + row[0].firstChild.innerText,
                    dataType: "json",
                })
            },
            deleteItem: function (item) {
                var row = $("#jsGrid.selected-row:first");
                if (typeof row[0] != "undefined") {
                    var rowindex = row[0].rowIndex - 1;
                }
                var row = $("#jsGrid2 .selected-row:first");

                return $.ajax({
                    url: "../api/deletesong/" + Cookies.get("username") + "/" + item.song_url + "/" + row[0].firstChild.innerText,
                    type: "DELETE",
                    dataType: "text",
                    success: function (data) {
                        $("#jsGrid").jsGrid("loadData").done(function () {
                            var rows = $(".jsgrid-row, .jsgrid-alt-row")
                            rows[rowindex].className += ' selected-row';
                        });

                    },
                    error: function (data) {
                        alert("Song delete failed");
                    }
                });
            }
        },

        fields: [
            { title: "song_url", css: "hide", name: "song_url", type: "textarea" },
            { title: "Artist", name: "song_artist", align: "left", type: "textarea", width: "35%" },
            { title: "Song name", name: "song_name", align: "left", type: "textarea", width: "35%" },
            { title: "Date Added", name: "date_created", align: "left", type: "textarea", width: "25%" },
            { type: "control", width: "5%", modeSwitchButton: false, editButton: false }
        ]
    });
});



var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '70%',
        width: '75%',

        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        },
        playerVars: {
            'modestbranding': 1,
            'autoplay': 0,
            'controls': 0,
            'rel': 0,
            'showinfo': 0
        }
    });
}

function onPlayerReady(event) {
    var row = $("#jsGrid .jsgrid-row:first");
    row[0].className += ' selected-row';
    player.loadVideoById(row[0].firstChild.innerText, 0, 'large');
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
        $('#playtoggle').removeClass('glyphicon glyphicon-stop').addClass('glyphicon glyphicon-play');
        var row = $("#jsGrid .selected-row:first");
        $("#jsGrid tr").removeClass("selected-row")
        row[0].nextSibling.className += ' selected-row';

        player.loadVideoById(row[0].nextSibling.firstChild.innerText, 0, 'large');
    }
    if (event.data == YT.PlayerState.PAUSED) {
        $('#playtoggle').removeClass('glyphicon glyphicon-stop').addClass('glyphicon glyphicon-play');
    }
    if (event.data == YT.PlayerState.PLAYING) {
        $('#volume').text(player.getVolume());

        var playerTotalTime = player.getDuration();
        var minutes = parseInt(playerTotalTime / 60) % 60;
        var seconds = Math.round(playerTotalTime % 60);
        $('#totaltime').text(minutes + ":" + ('0' + seconds).slice(-2));

        var row = $("#jsGrid .selected-row:first");
        $("#playtoggle").removeClass('glyphicon glyphicon-play').addClass('glyphicon glyphicon-stop');

        $('#nowplaying').text(row[0].childNodes[1].innerText + " - " + row[0].childNodes[2].innerText);

        mytimer = setInterval(function () {
            row[0].firstChild.innerText;
            var rows = $("#jsGrid").find('.jsgrid-row, .jsgrid-alt-row');

            rows.each(function (index) {
                if (rows[index].firstChild.innerText == row[0].firstChild.innerText) {
                    rows[index].className += ' selected-row';
                }
            });

            var playerCurrentTime = player.getCurrentTime();
            var minutes = parseInt(playerCurrentTime / 60) % 60;
            var seconds = Math.round(playerCurrentTime % 60);

            $('#currenttime').text(minutes + ":" + ('0' + seconds).slice(-2));
            $("#progress_slider").slider("option", "value", playerCurrentTime);
            $("#progress_slider").slider("option", "max", playerTotalTime);
        }, 500);

    } else {
        clearTimeout(mytimer);
    }
}