const { ObjectId } = require("mongodb");

class ContactService {
    constructor (client){
        this.Contact = client.db().collection("contacts");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    
    // Tạo một contact mới dựa vào đối số payload, nếu key nào undefined thì xóa luôn key đó
    extractContactData(payload){
        const contact = {
            name: payload.name,
            email: payload.email,
            address: payload.address,
            phone: payload.phone,
            favorite: payload.favorite,
        };
        //remove undefined fields
        Object.keys(contact).forEach((key) => {
            contact[key] === undefined && delete contact[key]
        });
        return contact;
    }

    // Thêm mới 1 contact mới (ứng dụng upsert: true) tìm không thấy thì thêm mới contact luôn 
    async create(payload){
        const contact = this.extractContactData(payload);
        const result = await this.Contact.findOneAndUpdate(
            contact,
            { $set: {
                favorite: contact.favorite === true
            }},
            {returnDocument: "after", upsert: true}
        );
        return result.value;
    }

    // Tìm contact với find không có đối số sẽ xuất ra hết các contacts
    async find(filter){
        const cursor = await this.Contact.find(filter);
        return await cursor.toArray();
    }

    // Tìm contact theo tên
    // $options để so khớp tên contact cần tìm kiếm theo biểu thức chính quy không phân biệt hoa thường
    async findByName(name){
        return await this.find({
            name: { $regex: new RegExp(name), $options: "i"},
        });
    }

    // Tìm contact theo id
    async findById(id){
        return await this.Contact.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    // Cập nhật theo id
    async update(id, payload){
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null
        };

        const update = this.extractContactData(payload);
        const result = await this.Contact.findOneAndUpdate(
            filter,
            {$set: update},
            {returnDocument: "after"},
        );
        return result.value;
    }

    // Xóa theo id
    async delete(id){
        const result = await this.Contact.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }

    // Tìm tất cả các contact có key favorite là true
    async findAllFavorite(){
        return await this.find({favorite: true});
    }

    // Xóa tất cả các contact trong database
    async deleteAll(){
        const result = await this.Contact.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = ContactService;
