using ES_GUI.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace ES_GUI.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        private IHostingEnvironment _hostingEnvironment;

        public HttpClient client;

        HttpResponseMessage response;

        public HomeController(ILogger<HomeController> logger, IHostingEnvironment hostingEnvironment)
        {
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;

            client = new HttpClient();
            client.BaseAddress = new Uri("https://localhost:44382/");
            client.DefaultRequestHeaders.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Document(string index)
        {
            ViewBag.index = index;
            return View();
        }

        public ContentResult GetIndexes()
        {
            try
            {
                response = client.GetAsync("GetIndexes").Result;
                if (!response.IsSuccessStatusCode)
                {
                    return new ContentResult
                    {
                        Content = "{\"data\":" + "[]" + "}",
                        ContentType = "application/json"
                    };
                }
                var jsonResultAsString = response.Content.ReadAsStringAsync().Result;
                return new ContentResult
                {
                    Content = jsonResultAsString,
                    ContentType = "application/json"
                };
            }
            catch
            {
                return new ContentResult
                {
                    Content = "{\"data\":" + "[]" + "}",
                    ContentType = "application/json"
                };
            }
        }

        public ContentResult DeleteIndex(string index)
        {
            try
            {
                response = client.DeleteAsync("DeleteIndex/" + index).Result;
                if (!response.IsSuccessStatusCode)
                {
                    return new ContentResult
                    {
                        Content = "{\"data\":\"error\"}",
                        ContentType = "application/json"
                    };
                }
                var jsonResultAsString = response.Content.ReadAsStringAsync().Result;
                return new ContentResult
                {
                    Content = jsonResultAsString,
                    ContentType = "application/json"
                };
            }
            catch
            {
                return new ContentResult
                {
                    Content = "{\"data\":\"error\"}",
                    ContentType = "application/json"
                };
            }
        }

        public ContentResult CreateIndex(string index)
        {
            try
            {
                response = client.PostAsync("CreateIndex/" + index, null).Result;
                if (!response.IsSuccessStatusCode)
                {
                    return new ContentResult
                    {
                        Content = "{\"data\":\"error\"}",
                        ContentType = "application/json"
                    };
                }
                var jsonResultAsString = response.Content.ReadAsStringAsync().Result;
                return new ContentResult
                {
                    Content = jsonResultAsString,
                    ContentType = "application/json"
                };
            }
            catch
            {
                return new ContentResult
                {
                    Content = "{\"data\":\"error\"}",
                    ContentType = "application/json"
                };
            }
        }

        public ContentResult GetDocuments(string index)
        {
            try
            {
                response = client.GetAsync("GetDocuments/" + index).Result;
                if (!response.IsSuccessStatusCode)
                {
                    return new ContentResult
                    {
                        Content = "{\"data\":" + "[]" + "}",
                        ContentType = "application/json"
                    };
                }
                var jsonResultAsString = response.Content.ReadAsStringAsync().Result;
                return new ContentResult
                {
                    Content = jsonResultAsString,
                    ContentType = "application/json"
                };
            }
            catch
            {
                return new ContentResult
                {
                    Content = "{\"data\":" + "[]" + "}",
                    ContentType = "application/json"
                };
            }
        }

        public ContentResult AddDocuments(string index)
        {
            try
            {
                IFormFile file = Request.Form.Files[0];
                string folderName = "UploadFile";
                string webRootPath = _hostingEnvironment.WebRootPath;
                string newPath = Path.Combine(webRootPath, folderName);
                if (!Directory.Exists(newPath))
                {
                    Directory.CreateDirectory(newPath);
                }
                string fullPath = Path.Combine(newPath, file.FileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    file.CopyTo(stream);
                    stream.Position = 0;
                }
                using (StreamReader r = new StreamReader(fullPath))
                {
                    string arrayOfDocumentAsString = r.ReadToEnd();
                    JArray jArray = JsonConvert.DeserializeObject<JArray>(arrayOfDocumentAsString);
                    string jsonDocumentAsString;
                    JObject jsonDocument;
                    for (int i = 0; i < jArray.Count; i++)
                    {
                        jsonDocumentAsString = jArray[i].ToString();
                        jsonDocumentAsString = jsonDocumentAsString.Replace(Environment.NewLine, string.Empty);
                        jsonDocument = JObject.Parse(jsonDocumentAsString);
                        response = client.PostAsync("AddDocument/" + index + "/" + jsonDocument["id"].ToString() + "/" + jsonDocumentAsString, null).Result;
                        if (!response.IsSuccessStatusCode)
                        {
                            return new ContentResult
                            {
                                Content = "{\"data\":\"error\"}",
                                ContentType = "application/json"
                            };
                        }
                    }
                }
                var jsonReturnAsString = "{\"data\":\"success\"}";
                return new ContentResult
                {
                    Content = jsonReturnAsString,
                    ContentType = "application/json"
                };
            }
            catch
            {
                return new ContentResult
                {
                    Content = "{\"data\":\"error\"}",
                    ContentType = "application/json"
                };
            }
        }

        public ContentResult DeleteDocument(string index, string id)
        {
            try
            {
                response = client.DeleteAsync("DeleteDocument/" + index + "/" + id).Result;
                if (!response.IsSuccessStatusCode)
                {
                    return new ContentResult
                    {
                        Content = "{\"data\":\"error\"}",
                        ContentType = "application/json"
                    };
                }
                var jsonResultAsString = response.Content.ReadAsStringAsync().Result;
                return new ContentResult
                {
                    Content = jsonResultAsString,
                    ContentType = "application/json"
                };
            }
            catch
            {
                return new ContentResult
                {
                    Content = "{\"data\":\"error\"}",
                    ContentType = "application/json"
                };
            }
        }

        public ContentResult SearchDocuments(string index, string query)
        {
            try
            {
                response = client.GetAsync("SearchDocuments/" + index + "/" + query).Result;
                if (!response.IsSuccessStatusCode)
                {
                    return new ContentResult
                    {
                        Content = "{\"data\":" + "[]" + "}",
                        ContentType = "application/json"
                    };
                }
                var jsonResultAsString = response.Content.ReadAsStringAsync().Result;
                return new ContentResult
                {
                    Content = jsonResultAsString,
                    ContentType = "application/json"
                };
            }
            catch
            {
                return new ContentResult
                {
                    Content = "{\"data\":" + "[]" + "}",
                    ContentType = "application/json"
                };
            }
        }
    }
}
