using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Newtonsoft.Json;
using GoodVibesWeb.Models;
using System.Text;

namespace GoodVibesWeb.Controllers
{
    public class SongDataController : ApiController
    {
        string sConn =
            "Data Source=samker.database.windows.net;" +
            "Initial Catalog=GOODVIBESDB;" +
            "User id=samk;" +
            "Password=Kuikka666;";

        [Route("api/getplaylist/{username}")]
        [HttpGet]
        public HttpResponseMessage Get(string username)
        {
            string result;
            List<Song> playlist = new List<Song>();
            
            using (SqlConnection sc = new SqlConnection(sConn))
            {
                sc.Open();
                string sql = "SELECT song_url, song_artist, song_name, creation_date FROM dbo.song_data where username = @username";
                SqlCommand com = new SqlCommand(sql, sc);
                com.Parameters.AddWithValue("@username", username);

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
        [Route("api/insertsong/")]
        [HttpPost]
        public HttpResponseMessage Post(Song s)
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
                    com.Parameters.AddWithValue("@username", "JSK");
                    com.Parameters.AddWithValue("@playlist_id", 0);
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

        [Route("api/deletesong/{username}/{song_url}")]
        [HttpDelete]
        public HttpResponseMessage Delete(string username, string song_url)
        {
            try
            {
                using (SqlConnection sc = new SqlConnection(sConn))
                {

                    sc.Open();
                    string sql = "Delete from song_data where song_url = @song_url and username = @username";
                    SqlCommand com = new SqlCommand(sql, sc);
                    com.Parameters.AddWithValue("@song_url", song_url);
                    com.Parameters.AddWithValue("@username", username);
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
    }
}
