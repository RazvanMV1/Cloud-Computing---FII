from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from router import route_request

class RequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        self._handle_request("GET")

    def do_POST(self):
        self._handle_request("POST")

    def do_PUT(self):
        self._handle_request("PUT")

    def do_PATCH(self):
        self._handle_request("PATCH")

    def do_DELETE(self):
        self._handle_request("DELETE")

    def _handle_request(self, method):
        try:
            body = self._read_body()
            status_code, response_data = route_request(method, self.path, body)
        except Exception as e:
            status_code = 500
            response_data = {
                "success": False,
                "error": "Internal Server Error",
                "details": str(e),
                "code": 500
            }
        self._send_response(status_code, response_data)

    def _read_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            raw_body = self.rfile.read(content_length)
            try:
                return json.loads(raw_body.decode("utf-8"))
            except json.JSONDecodeError:
                return None
        return None

    def _send_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        response_json = json.dumps(data, indent=2, default=str)
        self.wfile.write(response_json.encode("utf-8"))

    def log_message(self, format, *args):
        print(f"[{self.command}] {self.path} -> {args[1]}")


def run_server(host="0.0.0.0", port=8000):
    server_address = (host, port)
    httpd = HTTPServer(server_address, RequestHandler)
    print(f"Serverul ruleaza pe http://{host}:{port}")
    print("Apasa CTRL+C pentru a opri serverul...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServerul a fost oprit.")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
