import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnections,
  getPendingRequests,
  removeConnection,
  getSentRequests,
} from "../services/connection.service.js";

// SEND REQUEST
export const sendRequest = async (req, res) => {
  try {
    const { userId } = req.body;

    const data = await sendConnectionRequest(req.user.id, userId);

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ACCEPT REQUEST
export const acceptRequest = async (req, res) => {
  try {
    const { connectionId } = req.body;

    const data = await acceptConnectionRequest(req.user.id, connectionId);

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// REJECT REQUEST
export const rejectRequest = async (req, res) => {
  try {
    const { connectionId } = req.body;

    await rejectConnectionRequest(req.user.id, connectionId);

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET FRIENDS
export const getFriends = async (req, res) => {
  try {
    const data = await getConnections(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch connections" });
  }
};

// GET PENDING
export const getPending = async (req, res) => {
  try {
    const data = await getPendingRequests(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};
export const searchFriends = async (req, res) => {
  const { q } = req.query;

  const friends = await getConnections(req.user.id);

  const filtered = friends.filter((f) =>
    f.fullname.toLowerCase().includes(q.toLowerCase()),
  );

  res.json(filtered);
};
export const remove = async (req, res) => {
  try {
    const connectionId = parseInt(req.params.connectionId);

    await removeConnection(req.user.id, connectionId);

    res.json({ success: true });
  } catch (err) {
    console.error("REMOVE ERROR:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// controller
export const getSent = async (req, res) => {
  const data = await getSentRequests(req.user.id);
  res.json(data);
};
