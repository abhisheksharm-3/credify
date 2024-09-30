
import { ref, uploadBytesResumable, getDownloadURL, getStorage } from 'firebase/storage';
import { toast } from 'sonner';
import { app } from './FirebaseConfig';

export const uploadPhoto = async (imageUrl: string, photoType: 'profile' | 'id') => {
    const storage = getStorage(app);
    const fileName = `${photoType}-photo-${Date.now()}.jpg`;
    const metadata = { contentType: 'image/jpeg' };
    const storageRef = ref(storage, `Credify/${fileName}`);
    
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

        return new Promise<string>((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const fileProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                },
                (error) => {
                    toast.error('Upload failed');
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    } catch (error) {
        toast.error("Error converting image URL to blob");
        throw error;
    }
};
