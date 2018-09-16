package basics;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint(value = "/sessions/{room}")
public class Endpoint {

    static int sessionCounter = 0;

    @OnOpen
    public void onOpen(Session session, @PathParam("room") String room) {
        session.getUserProperties().put("room", room);
    }

    @OnMessage
    public void onMessage(Session session, String text) {
        ++sessionCounter;
        System.out.println("text: " + text);

        String room = (String) session.getUserProperties().get("room");
        System.out.println("room: " + room);
        try {
            for (Session s : session.getOpenSessions()) {
                if (s.isOpen() && room.equals(s.getUserProperties().get("room"))) {
                    s.getBasicRemote().sendText(Integer.toString(sessionCounter));
                }
            }
        } catch (IOException ex) {
            Logger.getLogger(Endpoint.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    @OnClose
    public void onClose(Session session) {
        System.out.println("FECHOU: " + session.getId());
        --sessionCounter;
        String room = (String) session.getUserProperties().get("room");
        try {
            for (Session s : session.getOpenSessions()) {
                if (s.isOpen() && room.equals(s.getUserProperties().get("room"))) {
                    s.getBasicRemote().sendText(Integer.toString(sessionCounter));
                }
            }
        } catch (IOException ex) {
            Logger.getLogger(Endpoint.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

}
