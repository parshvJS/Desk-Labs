import { account, databases, storage, avatars, appwriteConfig } from "./config";
import { ID, Query } from 'appwrite'

export async function getCurrentUser() {
    try {
        const userDetails = await account.get()
        if (!userDetails) return -1

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.user_bucketId,
            [Query.equal("accountId", [userDetails.$id])]
        )
        if (!currentUser) throw Error


        //returns all data of user 
        return currentUser.documents[0];

    } catch (error) {
        console.log(error)
    }
}

export async function createNewUser(user) {
    try {
        const newUser = await account.create(ID.unique(), user.email, user.password, user.name)

        if (!newUser) return Error;

        const userAvatar = avatars.getInitials(user.name)
        const dbUser = await saveUserToDb({
            accountId: newUser.$id,
            name: newUser.name,
            email: newUser.email,
            imageUrl: userAvatar,
            username: user.username
        })

        return dbUser;
    } catch (error) {
        console.log('createNewUser :: error : ', error);
        return error
    }
}



export async function saveUserToDb(user) {
    try {
        const storeInDbUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.user_bucketId,
            ID.unique(),
            user,
        )
        return storeInDbUser
    } catch (error) {
        console.log(error)
    }
}

export async function signInAccount(user) {
    try {
        const session = await account.createEmailSession(user.email, user.password)

        return session;

    } catch (error) {
        console.log(error)
        return error;
    }
}

export async function checkForCurrentUser() {
    try {
        const userDetails = await account.get()
        return userDetails
    } catch (error) {
        console.log(error)
    }
}

export async function signOutAccount() {
    try {
        const session = await account.deleteSession('current');
        return session;
    } catch (error) {
        // Log the error details
        console.error('Error signing out:', error);

    }
}

export async function createNewPost({ caption, desc, tags, imageId, imageUrl }) {
    try {
        console.log("i am getiing upload", { caption, imageUrl });
        const post = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.post_bucketId,
            ID.unique(),
            {
                caption: caption,
                desc: desc,
                tags: tags.trim().split(","),
                imageId: imageId,
                imageUrl: imageUrl
            }
        );
        if (!post) {
            throw new Error("Something went wrong while creating the post");
        }
        console.log(post);
        return post; // Return the created post
    } catch (error) {
        console.error("Error creating new post:", error.message);
        throw new Error(error.message);
    }
}
export async function getPostComments(postId) {
    try {
        const comments = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postComment_bucketId,
            [
                Query.equal("postId", postId),
                Query.select(["content", "userId"]),
                Query.limit(5),
                Query.orderDesc('$createdAt')
            ]
        );

        // Array to store comments with user details
        const commentsWithUserDetails = [];

        // Loop through each comment
        for (const comment of comments.documents) {
            // Get user details based on userId
            const user = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.user_bucketId,
                comment.userId,
                [
                    Query.select(['imageUrl', '$id',"name"]),
                ] 
            );

            commentsWithUserDetails.push({
                content: comment.content,
                imageUrl: user.imageUrl,
                userId: user.$id,
                name:user.name
            });
        }

        console.log(commentsWithUserDetails,"is comment for this post");
        return commentsWithUserDetails;
    } catch (error) {
        throw new Error(error.message);
    }
}




export async function getFeed() {
    try {
        const allPost = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.post_bucketId,
            [
                Query.limit(40),
                Query.offset(0),
                Query.orderDesc('$createdAt'),
                Query.select(["$id", "imageUrl", "caption"])
            ]
        )
        if (!allPost) return -1
        console.log(allPost, "asdasd");
        return allPost
    } catch (error) {
        throw new Error(error.message)
        return -1
    }
}

export async function getPostDetails(documentId) {
    try {

        const postDetails = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.post_bucketId,
            documentId,
            [
                Query.select(["imageUrl", "caption", "desc", "likes", "tags"])
            ]
        )
        if (!postDetails || postDetails.code >= 400 || postDetails.message) {
            return {
                success: false,
                message: postDetails.message
            }
        }
        return {
            success: true,
            data: postDetails
        }
    } catch (error) {

        throw new Error(error.message)

    }
}


export const likePost = async (documentId, user) => {
    try {
        console.log(documentId, user, "is liking");

        // Fetch the document
        const document = await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.post_bucketId, documentId);

        console.log(documentId, user, document, "is liking 1");

        // Ensure that the 'likes' attribute exists and is an array
        if (!Array.isArray(document.likes)) {
            document.likes = [];
        }

        console.log(documentId, user, "is liking 2");

        // Push the user into the 'likes' array
        document.likes.push(user);

        console.log(documentId, user, document, "is liking 2");

        // Update the document with the modified 'likes' array
        const response = await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.post_bucketId, documentId, {
            likes: document.likes // Only send the updated 'likes' array
        });

        console.log('User pushed into array attribute successfully:', response);
        console.log(documentId, user, "is liking 3");
    } catch (error) {
        console.error('Error pushing user into array attribute:', error);
    }
};
export const dislikePost = async (documentId, user) => {
    try {
        console.log(documentId, user, "is liking");

        // Fetch the document
        const document = await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.post_bucketId, documentId);

        console.log(documentId, user, document, "is liking 1");

        // Ensure that the 'likes' attribute exists and is an array
        if (!Array.isArray(document.likes)) {
            document.likes = [];
        }

        console.log(documentId, user, "is liking 2");

        // Push the user into the 'likes' array
        document.likes.pop(user);

        console.log(documentId, user, document, "is liking 2");

        // Update the document with the modified 'likes' array
        const response = await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.post_bucketId, documentId, {
            likes: document.likes // Only send the updated 'likes' array
        });

        console.log('User pushed into array attribute successfully:', response);
        console.log(documentId, user, "is liking 3");
    } catch (error) {
        console.error('Error pushing user into array attribute:', error);
    }
};


export async function makePostComment(postId, userId, content) {
    try {
        const now = new Date();
        const comment = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postComment_bucketId,
            ID.unique(),
            {
                postId: postId,
                userId: userId,
                content: content,
                createdAt: now
            }
        )

        if (!comment || comment.code >= 400 || comment.message) {
            return {
                success: false,
                message: comment.message
            }
        }

        return {
            success: true,
            data: comment
        }
    } catch (error) {
        throw new Error(error.message)
    }
}