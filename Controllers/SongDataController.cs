using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Newtonsoft.Json;
using GoodVibesWeb.Models;
using System.Text;
using System.Net.Http.Headers;
using System.Net.Http.Formatting;
using Google.Apis.YouTube.v3;
using Google.Apis.Services;

namespace GoodVibesWeb.Controllers
{
    public class SongDataController : ApiController
    {
        string sConn =
            ServerData.sconn;

        [Route("api/getplaylists/{username}")]
        [HttpGet]
        public HttpResponseMessage GetPlaylists(string username)
        {
            string result;
            List<Playlist> playlists = new List<Playlist>();

            using (SqlConnection sc = new SqlConnection(sConn))
            {
                sc.Open();
                string sql = "SELECT playlist_id, playlist_name FROM dbo.playlists where username = @username";
                SqlCommand com = new SqlCommand(sql, sc);
                com.Parameters.AddWithValue("@username", username);

                using (SqlDataReader reader = com.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        Playlist plist = new Playlist();
                        plist.playlist_id = reader["playlist_id"].ToString();
                        plist.playlist_name = reader["playlist_name"].ToString();
                        
                        playlists.Add(plist);
                    }
                }
            }

            result = JsonConvert.SerializeObject(playlists);
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(result, Encoding.UTF8, "application/json");

            return response;
        }

        [Route("api/insertplaylist/{username}")]
        public HttpResponseMessage InsertPlaylist(Playlist p, string username)
        {
            try
            {
                using (SqlConnection sc = new SqlConnection(sConn))
                {
                    sc.Open();
                    string sql = "insert into playlists(playlist_name, username) values(@playlist_name, @username)";
                    SqlCommand com = new SqlCommand(sql, sc);
                    com.Parameters.AddWithValue("@playlist_name", p.playlist_name);
                    com.Parameters.AddWithValue("@username", username);
                    com.ExecuteNonQuery();
                }
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
                return response;
            }
            catch
            {
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.BadRequest);
                return response;
            }
        }

        [Route("api/getplaylist/{username}/{playlist_id}")]
        [HttpGet]
        public HttpResponseMessage Get(string username, int playlist_id)
        {
            string result;
            List<Song> playlist = new List<Song>();
            
            using (SqlConnection sc = new SqlConnection(sConn))
            {
                sc.Open();
                string sql = "SELECT song_url, song_artist, song_name, creation_date FROM dbo.song_data where username = @username AND playlist_id = @playlist_id";
                SqlCommand com = new SqlCommand(sql, sc);
                com.Parameters.AddWithValue("@username", username);
                com.Parameters.AddWithValue("@playlist_id", playlist_id);

                using (SqlDataReader reader = com.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        Song song = new Song();
                        song.song_url = reader["song_url"].ToString();
                        song.song_artist = reader["song_artist"].ToString();
                        song.song_name = reader["song_name"].ToString();
                        DateTime dt = (DateTime)reader["creation_date"];
                        song.date_created = dt.ToShortDateString();
                        playlist.Add(song);
                    }
                }
            }

            result = JsonConvert.SerializeObject(playlist);
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(result, Encoding.UTF8, "application/json");

            return response;
        }

        [Route("api/auth")]
        [HttpPut]
        public HttpResponseMessage Auth(User u)
        {
            try
            {
                string hashedpassword = sha256(u.password + ServerData.salt);
                string passwordfromdb;

                using (SqlConnection sc = new SqlConnection(sConn))
                {
                    sc.Open();
                    string sql = "SELECT password from users where username = @username";
                    SqlCommand com = new SqlCommand(sql, sc);
                    com.Parameters.AddWithValue("@username", u.username);
                    object o = com.ExecuteScalar();
                    if (o != null)
                        passwordfromdb = o.ToString();
                    else
                        passwordfromdb = "";
                }

                if (hashedpassword == passwordfromdb)
                {
                    HttpResponseMessage respMessage = new HttpResponseMessage();
                    respMessage.Content = new ObjectContent<string[]>(new string[] { "Auth", "success" }, new JsonMediaTypeFormatter());
                    CookieHeaderValue cookie = new CookieHeaderValue("username", u.username);
                    cookie.Expires = DateTimeOffset.Now.AddDays(1);
                    cookie.Domain = Request.RequestUri.Host;
                    cookie.Path = "/";
                    respMessage.Headers.AddCookies(new CookieHeaderValue[] { cookie });
                    return respMessage;
                }

                else
                {
                    HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Forbidden);
                    return response;
                }
            }
            catch
            {
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.BadRequest);
                return response;
            }
        }


        [Route("api/createuser")]
        [HttpPost]
        public HttpResponseMessage CreateUser(User u)
        {
            try
            {
                using (SqlConnection sc = new SqlConnection(sConn))
                {
                    sc.Open();
                    string sql = "insert into users(username, password, email) values(@username, @password, @email)";
                    SqlCommand com = new SqlCommand(sql, sc);
                    com.Parameters.AddWithValue("@username", u.username);
                    com.Parameters.AddWithValue("@password", sha256(u.password + "suola123666"));
                    com.Parameters.AddWithValue("@email", u.email);
                    com.ExecuteNonQuery();

                    sql = "insert into playlists(playlist_name, username) values (@playlist_name, @username)";
                    com = new SqlCommand(sql, sc);
                    com.Parameters.AddWithValue("@playlist_name", "My Playlist");
                    com.Parameters.AddWithValue("@username", u.username);
                    com.ExecuteNonQuery();
                }
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
                return response;
            }
            catch
            {
              HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.BadRequest);
              return response;
            }
        }

        [Route("api/insertsong/{username}/{playlist_id}")]
        [HttpPost]
        public HttpResponseMessage Post(Song s, string username, int playlist_id)
        {
            try
            {
                using (SqlConnection sc = new SqlConnection(sConn))
                {

                    sc.Open();
                    string sql = "Insert into song_data (song_url,song_name,song_artist,username, playlist_id) values (@song_url,@song_name,@song_artist,@username,@playlist_id)";
                    SqlCommand com = new SqlCommand(sql, sc);
                    com.Parameters.AddWithValue("@song_url", s.song_url);
                    com.Parameters.AddWithValue("@song_name", s.song_name);
                    com.Parameters.AddWithValue("@song_artist", s.song_artist);
                    com.Parameters.AddWithValue("@username", username);
                    com.Parameters.AddWithValue("@playlist_id", playlist_id);
                    com.ExecuteNonQuery();
                }

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new StringContent("Song added", Encoding.UTF8, "application/json");

                return response;
            }
            catch
            {
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.BadRequest);
                return response;
            }
        }

        [Route("api/deleteplaylist/{username}/{playlist_id}")]
        [HttpDelete]
        public HttpResponseMessage DeletePlaylist(string username, string playlist_id)
        {
            try
            {
                using (SqlConnection sc = new SqlConnection(sConn))
                {

                    sc.Open();
                    string sql = "Delete from playlists where playlist_id = @playlist_id and username = @username";
                    SqlCommand com = new SqlCommand(sql, sc);
                    com.Parameters.AddWithValue("@playlist_id", playlist_id);
                    com.Parameters.AddWithValue("@username", username);
                    com.ExecuteNonQuery();
                }

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new StringContent("Playlist deleted", Encoding.UTF8, "application/json");

                return response;
            }
            catch
            {
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.BadRequest);
                return response;
            }
        }

        [Route("api/deletesong/{username}/{song_url}/{playlist_id}")]
        [HttpDelete]
        public HttpResponseMessage Delete(string username, string song_url, int playlist_id)
        {
            try
            {
                using (SqlConnection sc = new SqlConnection(sConn))
                {

                    sc.Open();
                    string sql = "Delete from song_data where song_url = @song_url and username = @username and playlist_id = @playlist_id";
                    SqlCommand com = new SqlCommand(sql, sc);
                    com.Parameters.AddWithValue("@song_url", song_url);
                    com.Parameters.AddWithValue("@username", username);
                    com.Parameters.AddWithValue("@playlist_id", playlist_id);
                    com.ExecuteNonQuery();
                }

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new StringContent("Song deleted", Encoding.UTF8, "application/json");

                return response;
            }
            catch
            {
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.BadRequest);
                return response;
            }
        }

        [Route("api/searchyoutube/{keyword}")]
        [HttpGet]
        public async System.Threading.Tasks.Task<HttpResponseMessage> SearchYoutube(string keyword)
        {
            var youtubeService = new YouTubeService(new BaseClientService.Initializer()
            {
                ApiKey = ServerData.apikey,
                ApplicationName = this.GetType().ToString()
            });

            var searchListRequest = youtubeService.Search.List("snippet");
            searchListRequest.Q = keyword;
            searchListRequest.MaxResults = 50;

            // Call the search.list method to retrieve results matching the specified query term.
            var searchListResponse = await searchListRequest.ExecuteAsync();

            List<Song> videos = new List<Song>();

            // Add each result to the appropriate list, and then display the lists of
            // matching videos, channels, and playlists.
            foreach (var searchResult in searchListResponse.Items)
            {
                if (searchResult.Id.Kind == "youtube#video")
                {
                    Song s = new Song();
                    s.title = searchResult.Snippet.Title;
                    s.song_url = searchResult.Id.VideoId;
                    videos.Add(s);
                }
            }

            string result = JsonConvert.SerializeObject(videos);
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(result, Encoding.UTF8, "application/json");

            return response;
        }

        static string sha256(string password)
        {
            System.Security.Cryptography.SHA256Managed crypt = new System.Security.Cryptography.SHA256Managed();
            System.Text.StringBuilder hash = new System.Text.StringBuilder();
            byte[] crypto = crypt.ComputeHash(Encoding.UTF8.GetBytes(password), 0, Encoding.UTF8.GetByteCount(password));
            foreach (byte theByte in crypto)
            {
                hash.Append(theByte.ToString("x2"));
            }
            return hash.ToString();
        }
    }
}
