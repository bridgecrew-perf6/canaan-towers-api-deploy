const Admin = require('../models/admin')
const { success, error, errorUnauthorized } = require('../responseFormatter/response')

// const adminLogin = async (req, res) => {
//     try {
//         const admin = await Admin.findByCredentials(req.body.email, req.body.password)
//         const token = await admin.generateAuthToken()
//         res.status(200).json({
//             status: 'success',
//             message: 'Ok',
//             data: { admin, token }
//         })
//     } catch (e) {
//         res.status(400).send()
//     }
// }
const createAdmin = async (req, res) => {
    const admin = new Admin({ ...req.body, role: '1', active: true })
    try {
        await admin.save()
        const token = await admin.generateAuthToken()
        res.status(201).json(success({ admin, token })) 
    } catch (error) {
        res.status(400).json(error('Bad request', error.message)) 
    }
}

const createsubAdmin = async (req, res) => {
    console.log(req.file)

    const admin = new Admin({ 
        ...req.body, role: '2',
        active: true,
        image: `${process.env.DEPLOYED_URL}/${req.file.filename}`,
    })
    try {
        await admin.save()
        const token = await admin.generateAuthToken()
        res.status(201).json(success({ admin, token })) 
    } catch (e) {
        res.status(400).json(error('Bad request', e.message))
    }
}

const adminLogin = async (req, res) => {
    try {
        const admin = await Admin.findByCredentials(req.body.email, req.body.password)
        const token = await admin.generateAuthToken()
        res.status(200).json(success({ admin, token }))
    } catch (error) {
        res.status(400).json(error('Bad request', error.message))
    }
}


const revokeAdmin = async (req, res) => { 
    try {
        const permission = await Admin.findOne({ _id: req.id, 'role': '1' })
        if(!permission) {
            res.status(401).json(errorUnauthorized('Error. Unauthorized user'))
        }

        req.body.active = false;

        const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    
        if (!admin) {
            return res.status(404).json(error('Bad request', 'User not found'))
        }

        await admin.save()
        res.status(200).json(success( admin))
    } catch (e) {
        res.status(500).json({message: e.message})
    }
}

const activeAdmin = async (req, res) => { 
    try {
        const permission = await Admin.findOne({ _id: req.id, 'role': '1' })
        if(!permission) {
            res.status(401).json(errorUnauthorized('Error. Unauthorized user'))
        }

        req.body.active = true;

        const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    
        if (!admin) {
            return res.status(404).json(error('Bad request', 'User not found'))
        }

        await admin.save()
        res.status(200).json(success({ admin }))
    } catch (e) {
        res.status(500).json({message: e.message})
    }
}

const viewsubAdmin = async (req, res) => { 
    try {
        const permission = await Admin.findOne({ _id: req.id, 'role': '1' })
        if(!permission) {
            res.status(401).json(errorUnauthorized('Error. Unauthorized user'))
        }
        const admin = await Admin.find({ 'role': '2'})
        res.status(200).json(success({ admin }))
    } catch (e) {
        res.status(500).json({message: e.message})
    }
}

const singleLogout = async (req, res) => {
    try {
        req.admin.tokens = req.admin.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.admin.save()

        res.send()
    } catch (e) {
        res.status(500).json({message: e.message})
    }
}

const logoutAll = async (req, res) => {
    try {
        req.admin.tokens = []
        await req.admin.save()
        res.send()
    } catch (e) {
        res.status(500).json({message: e.message})
    }
}

const updateProfile = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'number']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).json(error('Bad request', 'Invalid updates'))
    }

    try {
        updates.forEach((update) => req.admin[update] = req.body[update])
        await req.admin.save()
        let update = req.admin
        res.status(200).json(success({ update }))
    } catch (e) {
        res.status(500).json({message: e.message})
    }
}

module.exports = { createAdmin, createsubAdmin, revokeAdmin, activeAdmin, viewsubAdmin, singleLogout, logoutAll, updateProfile, adminLogin }