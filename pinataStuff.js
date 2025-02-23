import { PinataSDK } from "pinata";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
// import fetch from "node-fetch";
// import { fileURLToPath } from "url";
// import { dirname } from "path";
dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
const PINATA_JWT = process.env.PINATA_JWT;
const GATEWAY_URL = process.env.GATEWAY_URL;

const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: GATEWAY_URL,
});

//const file = new File(["ever since i was a jit kdfl;sfdafkfsfhfghfgfh"], "testing.txt", { type: "text/plain" });
async function uploadUserFile(fileContents, userName, category) {
    const file = new File([userName+category], `${userName}_${category}.csv`, { type: "text/csv" });
    try {
    //   const groups = await pinata.groups.list();
    //   const group = groups[0].id;
      const upload = await pinata.upload.file(file).addMetadata({
        keyvalues: {
          "data": fileContents,
        },
      })
      console.log(upload);
      return upload;
    } catch (error) {
      throw error;
    }
  }
  


async function uploadUserFiles(username) {
    try{
        await uploadUserFile("Symptom Description,date/frequency", username, "Symptoms");
        await uploadUserFile("medication,dosageMG,frequency,reasonPrescribed", username, "Medications");
        await uploadUserFile("DOB,height,weight,timestamp", username, "General");
    }
    catch(error) {
        console.log(error);
    }
   
}

async function fetchFilesByUsername(username) {
    const file1 = await fetchFileByUserNameAndCategory(username, "Medications");
    const file2 = await fetchFileByUserNameAndCategory(username, "Symptoms");
    const file3 = await fetchFileByUserNameAndCategory(username, "General");
  
    // Define the userData directory relative to the current working directory.
    
    
    const userDataDir = path.join(process.cwd(), "userData");
    // const filePath = path.join(userDataDir, `${username}_Medications.csv`);
    
    
    // const userDataDir = path.join(__dirname, 'userData');
    // console.log("Current working directory:", process.cwd());

    
    // Overwrite (or create) the userData directory
    if (fs.existsSync(userDataDir)) {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    }
    fs.mkdirSync(userDataDir, { recursive: true });

    let filePath = path.join(userDataDir, `${username}_Medications.csv`);
    fs.writeFileSync(filePath, file1.keyvalues.data, "utf8");

    filePath = path.join(userDataDir, `${username}_Symptoms.csv`);
    fs.writeFileSync(filePath, file2.keyvalues.data, "utf8");

    filePath = path.join(userDataDir, `${username}_General.csv`);
    fs.writeFileSync(filePath, file3.keyvalues.data, "utf8");
    // [file1,file2,file3].forEach(file => {
    //     try {
    //         const filePath = path.join(userDataDir, file.name);
    //         fs.writeFileSync(filePath, file.keyvalues.data, "utf8");
    //     }
    //     catch(error) {
    //         console.log(error);
    //     }
    // });
    //  // Headers for authenticated requests
    //  const headers = {
    //     'Authorization': `Bearer ${PINATA_JWT}`
    //  };
    //  const response = await fetch(fileUrl, { headers });

  
    // Write the fetched file metadata into the directory as JSON files
    /*
    if (file1 && file1.cid) {
        try {
          const fileUrl = new URL(`${GATEWAY_URL}/ipfs/${file1.cid}`);
          console.log("Fetching Medications file from:", fileUrl.toString());
          const response = await fetch(fileUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const csvContent = await response.text(); // Get the CSV content as plain text
          const filePath = path.join(userDataDir, `${username}_Medications.csv`);
          fs.writeFileSync(filePath, csvContent, "utf8");
          console.log("Medications CSV written to:", filePath);
        } catch (error) {
          console.error("Error fetching Medications CSV:", error);
        }
      } else {
        console.log("Medications file not found or missing CID");
      }
    */
    /*
    if (file1) {
    // const fileUrl = `${GATEWAY_URL}/ipfs/${file1.IpfsHash}`;
    // const response = await fetch(fileUrl);
    // const csvContent = await response.text();

    fs.writeFileSync(
        path.join(userDataDir, `${username}_Medications.json`),
        JSON.stringify(file1, null, 2)
        // csvContent
      );
    }
      */

    // if (file2) {
    // const fileUrl = `${GATEWAY_URL}/ipfs/${file2.IpfsHash}`;
    // const response = await fetch(fileUrl);
    // const csvContent = await response.text();
    // fs.writeFileSync(
    //     path.join(userDataDir, `${username}_Symptoms.csv`),
    //     // JSON.stringify(file2, null, 2)
    //     csvContent
    //   );
    // }
    // if (file3) {
    // const fileUrl = `${GATEWAY_URL}/ipfs/${file3.IpfsHash}`;
    // const response = await fetch(fileUrl);
    // const csvContent = await response.text();  
    // fs.writeFileSync(
    //     path.join(userDataDir, `${username}_General.csv`),
    //     // JSON.stringify(file3, null, 2)
    //     csvContent
    //   );
    // }
    // Fetch and write the actual CSV content for each file
    // if (file1 && file1.cid) {
    //     let fileUrl; // declare in outer scope
    //     try {
    //       let gateway = GATEWAY_URL;
    //       if (!gateway.startsWith("http://") && !gateway.startsWith("https://")) {
    //         gateway = "https://" + gateway;
    //       }
    //       fileUrl = new URL(`${gateway}/ipfs/${file1.cid}`);
    //       console.log("Fetching Medications CSV from URL:", fileUrl.toString());
          
    //       const response = await fetch(fileUrl, { headers });
    //       if (!response.ok) {
    //         throw new Error(`HTTP error! status: ${response.status}`);
    //       }
    //       const csvContent = await response.text();
    //       const filePath = path.join(userDataDir, `${username}_Medications.csv`);
    //       fs.writeFileSync(filePath, csvContent, "utf8");
    //       console.log("Medications CSV written to:", filePath);
    //     } catch (error) {
    //       console.error("Error fetching Medications CSV:", error);
    //     }
    //   } else {
    //     console.log("Medications file not found or missing CID");
    //   }
      
      
      
    // if (file1 && file1.cid) {
    //     try {
    //         const fileUrl = new URL(`https://gateway.pinata.cloud/ipfs/${file1.cid}`);
    //         console.log("Fetching Medications from URL:", fileUrl.toString());
    //         const response = await fetch(fileUrl, { headers });
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         const csvContent = await response.text();
    //         const filePath = path.join(userDataDir, `${username}_Medications.csv`);
    //         fs.writeFileSync(filePath, csvContent, "utf8");
    //         console.log("Medications file written to:", filePath);
    //         console.log("File content:", csvContent);
    //     } catch (error) {
    //         console.error("Error fetching Medications file:", error);
    //     }
    // } else {
    //     console.log("Medications file not found or missing CID");
    // }
    
    // if (file2 && file2.cid) {
    //     try {
    //         const fileUrl = new URL(`https://gateway.pinata.cloud/ipfs/${file2.cid}`);
    //         console.log("Fetching Symptoms from URL:", fileUrl.toString());
    //         const response = await fetch(fileUrl, { headers });
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         const csvContent = await response.text();
    //         const filePath = path.join(userDataDir, `${username}_Symptoms.csv`);
    //         fs.writeFileSync(filePath, csvContent, "utf8");
    //         console.log("Symptoms file written to:", filePath);
    //         console.log("File content:", csvContent);
    //     } catch (error) {
    //         console.error("Error fetching Symptoms file:", error);
    //     }
    // } else {
    //     console.log("Symptoms file not found or missing CID");
    // }
    
    // if (file3 && file3.cid) {
    //     try {
    //         const fileUrl = new URL(`https://gateway.pinata.cloud/ipfs/${file3.cid}`);
    //         console.log("Fetching General from URL:", fileUrl.toString());
    //         const response = await fetch(fileUrl, { headers });
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         const csvContent = await response.text();
    //         const filePath = path.join(userDataDir, `${username}_General.csv`);
    //         fs.writeFileSync(filePath, csvContent, "utf8");
    //         console.log("General file written to:", filePath);
    //         console.log("File content:", csvContent);
    //     } catch (error) {
    //         console.error("Error fetching General file:", error);
    //     }
    // } else {
    //     console.log("General file not found or missing CID");
    // }

    // // Verify files were written
    // const files = fs.readdirSync(userDataDir);
    // console.log("Files in userData directory:", files);
    
    // if (files.length === 0) {
    //     console.log("Warning: No files were written to the userData directory");
    // } else {
    //     console.log("Successfully wrote files to userData directory");
    // }
  return { file1, file2, file3 };
}
  
async function fetchFileByUserNameAndCategory(userName, category) {
    try {
        const fileName = userName + "_" + category;
        // List files with the specified name filter
        const response = await pinata.files.list().name(fileName).limit(1); // Limit results for optimization
        
        // Check if any files are returned
        if (response.files && response.files.length > 0) {
        const file = response.files[0]; // Assuming the first result is desired
        console.log("File found:", file);
        
        return file;
        } else {
             console.log("No file found with the name:", fileName);
            return null;
        }
    } catch (error) {
    console.error("Error fetching file by name:", error.message);
    // throw error;
    // Handle error or retry logic as needed
  }
}

// module.exports = {
//     uploadUserFile,
//     fetchFileByUserNameAndCategory
//   };

export {
    uploadUserFiles,
    fetchFilesByUsername
};
  