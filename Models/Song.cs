using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GoodVibesWeb.Models
{
    public class Song
    {
        public string song_artist { get; set; }
        public string song_name { get; set; }
        public string song_url { get; set; }
        public string date_created { get; set; }
        
        public string username { get; set; }
        public string playlist_id { get; set; }
    }
}