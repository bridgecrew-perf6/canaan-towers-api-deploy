const express = require('express')
const Building = require('../../models/services/building')
const Admin = require('../../models/admin')
const authAdmin = require('../../middleware/authAdmin')
const upload = require('../../middleware/multer')
const router = new express.Router() 


// Building Endpoint
router.post('/building', authAdmin, upload.fields([{ name: 'carousel', maxCount: 3 }, { name: 'slider', maxCount: 3 }]), async (req, res) => {
    if(req.files){
            if(req.files.carousel) {
                let carousels = [];
                req.files.carousel.forEach(photo => {
                    let url = `${process.env.DEPLOYED_URL}/${photo.filename}`
                    carousels.push(url);
                }); 

                carousel = carousels;
            }
            if(req.files.slider) {
                let sliders = [];
                req.files.slider.forEach(photo => {
                    let url = `${process.env.DEPLOYED_URL}/${photo.filename}`
                    sliders.push(url);
                }); 

                slider = sliders;
            }
    }
    const building = new Building({...req.body, carousel, slider })
    try {
        await building.save()
        res.status(201).send(building)
    } catch (error) {
        res.status(400).send(error)
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})


router.get('/building', async (req, res) => {
    try {
        const building = await Building.find({})
        // const admin = await Admin.findOne({ 'role': '1'})
        // console.log(admin.role);
        // let adminrole = admin.role = '1'
        // console.log(adminrole)

        // if(!adminrole) {
        //     res.status(400).send()
        // }

        res.send(building)
    } catch (e) {
        res.status(500).send('Error occured')
    }
})

router.get('/building/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const building = await Building.findById(_id)
        if (!building) {
            return res.status(404).send()
        }

        res.send(building)
    } catch (e) {
        res.status(500).send('Error occured')
    }
})

router.patch('/building/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'images']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    console.log(isValidOperation);

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const building = await Building.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    
        if (!building) {
            return res.status(404).send()
        }

        res.send(building)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/building/:id', async (req, res) => {
    try {
        const building = await Building.findByIdAndDelete(req.params.id)

        if (!building) {
            return res.status(404).send()
        }

        res.send(building)
    } catch (e) {
        res.status(500).send()
    }
})


module.exports = router
