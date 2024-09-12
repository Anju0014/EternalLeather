
import User from '../../model/userModel.mjs'; // Import your user model

export const adminuserget= async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.render('adminUser', { message:users }); // Render user management page with users
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Route to toggle block status
export const adminuserpost= async (req, res) => {
    try{
    const { id } = req.params;
    const { blockStatus } = req.body; // Get the selected value from the dropdown
    const user = await User.findById(id);

    // if (!user) {
    //     return res.status(404).send('User not found');
    // }

    // Update the isBlocked status based on the dropdown value
    user.isBlocked = blockStatus === 'block' ? true: false;
    await user.save();

    res.redirect('/admin/user'); // Redirect back to the user management page
}catch (error) {
    console.error('Error toggling block status:', error);
    res.status(500).send('Internal Server Error');
}
};

