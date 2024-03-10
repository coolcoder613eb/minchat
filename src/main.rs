/// An example of a chat web application server
extern crate ws;

use serde::{Deserialize, Serialize};
use ws::{listen, Handler, Message, Request, Response, Result, Sender};

#[derive(Serialize, Deserialize, Debug)]
struct MinMessage {
    username: String,
    message: String,
}
// Server web application handler
struct Server {
    out: Sender,
}

impl Handler for Server {
    //
    fn on_request(&mut self, req: &Request) -> Result<Response> {
        // Using multiple handlers is better (see router example)
        match req.resource() {
            // The default trait implementation
            "/ws" => Response::from_request(req),

            // Create a custom response
            "/" => Ok(Response::new(
                200,
                "OK",
                std::fs::read("frontend/index.html")
                    .expect("failed to read file")
                    .to_vec(),
            )),
            // Create a custom response
            "/favicon.ico" => Ok(Response::new(
                200,
                "OK",
                std::fs::read("frontend/favicon.ico")
                    .expect("failed to read file")
                    .to_vec(),
            )),
            // Create a custom response
            "/index.js" => Ok(Response::new(
                200,
                "OK",
                std::fs::read("frontend/index.js")
                    .expect("failed to read file")
                    .to_vec(),
            )),
            // Create a custom response
            "/style.css" => Ok(Response::new(
                200,
                "OK",
                std::fs::read("frontend/style.css")
                    .expect("failed to read file")
                    .to_vec(),
            )),

            _ => Ok(Response::new(404, "Not Found", b"404 - Not Found".to_vec())),
        }
    }
    // Handle messages received in the websocket (in this case, only on /ws)
    fn on_message(&mut self, msg: Message) -> Result<()> {
        let message: MinMessage = serde_json::from_str(msg.as_text().expect("Invalid text!"))
            .expect("Failed to parse JSON!")/*FIXME*/;
        println!("{:#?}", message);
        if message.username != "system" {
            self.username = message.username;
        }
        // Broadcast to all connections
        self.out.broadcast(msg)
    }
    /*
    fn on_shutdown(&mut self) {
        let msg = serde_json::to_string(&MinMessage {
            username: String::from("System"),
            message: format!("{} left.", self.username),
        })
        .expect("Failed to dump markdown.");
        let _ = self.out.broadcast(msg);
    }
    */
}

fn main() {
    // Listen on an address and call the closure for each connection
    listen("0.0.0.0:80", |out| Server { out }).unwrap()
}
