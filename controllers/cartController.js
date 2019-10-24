const { 
    webPush, 
    simplePushOptions,
    imagePushOptions, 
    actionPushOptions,
    dataPushOptions,
    handleCartAbandoned
} = require('../util/webPush');
const { User } = require('../models/user');

// * GET /user/push/:type
exports.sendPush = async (req, res) => {
    const { type } = req.params;
    const { user } = req;

    let options = {};

    switch (type) {
        case 'simple':
            options = simplePushOptions;
        break;
        case 'image':
            options = imagePushOptions;
        break;
        case 'data':
            options = dataPushOptions;
        break;
        case 'action':
            options = actionPushOptions;
            break;
    }
        
    try {
        await webPush.sendNotification(user.pushSubscription, JSON.stringify(options));
        res.status(200).end();

    } catch (error) {
        if (error.statusCode === 410 && error.name === 'WebPushError') {
            console.log("cartController.sendPush -> WebPushError", error);
            res.status(404).send(error.body + 'Please subscribe again.');
            
        } else {
            console.log("cartController.sendPush: -> error", error);
            res.status(400).send('There was an error while trying to send the notification');
            
        }
    }
};

// * GET /cart
exports.getCartItems = async (req, res) => {
    const { user } = req;

    try {
        res.status(200).send(user.cart_items);

    } catch (error) {
        console.log("cartController.getCartItems -> error", error);
        res.status(400).send();

    }
};

// * POST /cart {body: item}
exports.addItemToCart = async (req, res) => {
    const { item } = req.body;
    const { user } = req;

    try {
        
        if (typeof user.cart_items !== 'object') {
            user.cart_items = [item];
        } else {
            user.cart_items.push(item);
        }
        
        // * set a custom timeout after which to check user's shopping cart
        // const CART_ABANDON_TIMEOUT = 5000;
        // setTimeout(function() { handleCartAbandoned(user); }, CART_ABANDON_TIMEOUT);

        await user.save();
        res.status(200).send(user.cart_items.length.toString());

    } catch (error) {
        console.log("cartController.addItemToCart -> error", error);
        res.status(400).send();

    }
};

// * DELETE /cart:itemName
exports.deleteItemFromCart = async (req, res) => {
    const { itemName } = req.params;
    const { user } = req;

    try {
        const item = user.cart_items.find(cart_item => cart_item.name === itemName);
        user.cart_items.pull(item);

        await user.save();
        res.status(200).send(user.cart_items.length.toString());

    } catch (error) {
        console.log("cartController.deleteItemFromCart -> error", error);
        res.status(400).send();

    }
};

// * DELETE /cart/all
exports.clearCart = async (req, res) => {
    const { user } = req;

    try {
        // * remove all items from the user's cart_items array
        const items = user.cart_items.splice(0, user.cart_items.length);
        await user.save();

        res.status(200).send(items);

    } catch (error) {
        console.log("clearCart.deleteItemFromCart -> error", error);
        res.status(400).send();

    }
};

// * GET /checkout
exports.checkout = async (req, res) => {
    const { user } = req;
    
    try {
        // ? handle user checkout headers

        // * remove all items from the user's cart_items array
        const items = user.cart_items.splice(0, user.cart_items.length);
        await user.save();

        res.status(200).send(items);

    } catch (error) {
        console.log("cartController.checkout -> error", error);
        res.status(400).send();

    }
}