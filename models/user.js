const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  expireToken: Date,
  pic: {
    type: String,
    default:
      'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
  },
  private: {
    type: Boolean,
    default: false,
  },
  followers: [{ type: ObjectId, ref: 'User' }],
  pendingrequests: [{ type: Object, ref: 'User' }],
  following: [{ type: ObjectId, ref: 'User' }],
});

mongoose.model('User', userSchema);
