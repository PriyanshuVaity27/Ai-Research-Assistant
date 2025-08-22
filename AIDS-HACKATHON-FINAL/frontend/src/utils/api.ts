export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("http://127.0.0.1:5000/upload", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");
        
        const data = await response.json();
        return data.file_path; // Example: "/uploads/research_paper.pdf"
    } catch (error) {
        console.error("Upload error:", error);
        return null;
    }
};  
