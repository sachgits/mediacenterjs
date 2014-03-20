/*
 MediaCenterJS - A NodeJS based mediacenter solution

 Copyright (C) 2013 - Jan Smolders

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
(function($){

    var ns = 'mcjsm';
    var methods = {};

    function _init(options) {
        var opts = $.extend(true, {}, $.fn.mcjsm.defaults, options);
        return this.each(function() {
            var $that = $(this);
            var o = $.extend(true, {}, opts, $that.data(opts.datasetKey));

            // add data to the defaults (e.g. $node caches etc)
            o = $.extend(true, o, {
                musicCache : [],
                $that : $that
            });

            // use extend(), so no o is used by value, not by reference
            $.data(this, ns, $.extend(true, {}, o));

        });
    }


    /**** Start of custom functions ***/

    function _playSingle(o, album){
        var track = '/music/none/'+album+'/play'
            , songTitle = album
            , random = false
            , album = 'none';

        _playTrack(o,track,album,songTitle,random);
    }


    function _trackClickHandler(o, currentItem){
        $('.random').removeClass('active');
        var album = o.currentAlbum
            , track = '/music/'+ album +'/'+currentItem+'/play/'
            , random = false
            , songTitle = currentItem;

        _playTrack(o,track,album,songTitle,random);
    }

    function _playTrack(o,track,album,songTitle,random){
        if(!$('.random').length){
            $(o.playerSelector).append('<div class="random hidden">Random</div>')
        }
        $('.random').removeClass('hidden');

        $(o.playerSelector).addClass('show');

        videojs(o.playerID).ready(function(){
            var myPlayer = this;

            myPlayer.src(track);
            myPlayer.play();

            $('.random').on('click tap', function(e) {
                if($(this).hasClass('active')){
                    $(this).removeClass('active');
                } else{
                    $(this).addClass('active');
                }

                _randomTrack(o);
            });

            myPlayer.on("pause", function(){
                if($('.boxed').hasClass('playing')){
                    $('.boxed.playing.selected').addClass('pause')
                } else {
                    $('.'+o.selectedClass+' > .eq').addClass('pause');
                }
            });

            myPlayer.on("play", function(){
                if($('.boxed').hasClass('playing')){
                    $('.boxed.playing.selected').removeClass('pause')
                } else {
                    $('.'+o.selectedClass+' > .eq').removeClass('pause');
                }
            });

            myPlayer.on("ended", function(){
                if(random === false){
                    $('.random').removeClass('active');
                    _nextTrack(o,album,songTitle);
                } else if(random === true){
                    _randomTrack(o);
                }
            });
        });
    }

    function _nextTrack(o,album,songTitle){
        var random = false;
        var index = o.tracks.indexOf(songTitle);

        if(index >= 0 && index < o.tracks.length - 1){
            nextItem = o.tracks[index + 1];
            songTitle = nextItem;
        } else{
            return;
        }

        var track = '/music/'+album+'/'+nextItem+'/play';

        $('li.'+o.selectedClass).removeClass(o.selectedClass);
        $(o.trackListSelector).find('li:contains('+nextItem+')').addClass(o.selectedClass);

        _playTrack(o,track,album,songTitle,random);
    }

    function _randomTrack(o){
        $('li.'+o.selectedClass).removeClass(o.selectedClass);

        var random = true
            , elemLength = o.tracks.length
            , randomNum = Math.floor(Math.random()*elemLength)
            , nextItem = o.tracks[randomNum];

        $(o.trackListSelector).find('li:contains('+nextItem+')').addClass(o.selectedClass);

        var track = '/music/'+album+'/'+nextItem+'/play';

        _playTrack(o,track,album,songTitle,random);
    }

    /**** End of custom functions ***/

    $.fn.mcjsm = function( method ) {
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || !method ) {
            return _init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.fn.mcjsm' );
        }
    };

    /* default values for this plugin */
    $.fn.mcjsm.defaults = {
        datasetKey: 'mcjsmusic' //always lowercase
        , musicListSelector: '.music'
        , trackListSelector: '#tracklist'
        , playerSelector: '#player'
        , headerSelector: '#header'
        , backLinkSelector: '.backlink'
        , playerID: 'player'
        , selectedClass: 'selected'
        , focusedClass: 'focused'
        , activeSubLevel :'.mcjs-rc-active'
    };

})(jQuery);
