const { v4: uuidv4 } = require('uuid');
const db = require('../models');
const Message = db.Messages;

// 📝 Tạo tin nhắn mới
exports.createMessage = async (req, res) => {
    try {
        const { chat_rooms_id, sender, content } = req.body;

        if (!chat_rooms_id || !sender || !content) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newMessage = await Message.create({
            messages_id: uuidv4(),
            chat_rooms_id,
            sender,
            content,
        });

        res.status(201).json({ message: 'Message created', messageData: newMessage });
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// 📨 Lấy tin nhắn theo ID
exports.getMessageById = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Message.findByPk(id);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.status(200).json(message);
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// 🔥 Lấy tất cả tin nhắn trong chat room theo `chat_rooms_id`
exports.getMessagesByChatRoom = async (req, res) => {
    try {
        const { chat_rooms_id } = req.params;
        const messages = await Message.findAll({
            where: { chat_rooms_id },
            order: [['createdAt', 'ASC']], // Sắp xếp từ tin nhắn cũ đến mới
        });

        if (!messages.length) {
            return res.status(404).json({ message: 'No messages found in this chat room' });
        }

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// ✏️ Cập nhật nội dung tin nhắn
exports.updateMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const message = await Message.findByPk(id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        await message.update({ content });

        res.status(200).json({ message: 'Message updated', messageData: message });
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// ❌ Xóa tin nhắn
exports.deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await Message.findByPk(id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        await message.destroy();
        res.status(200).json({ message: 'Message deleted' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
