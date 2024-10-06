import mongoose from 'mongoose';

const cabBookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    date: { type: Date, required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' }     
});

const CabBooking = mongoose.model('CabBooking', cabBookingSchema);

export default CabBooking;
