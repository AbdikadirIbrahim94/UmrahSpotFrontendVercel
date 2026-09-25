export interface MulterS3File extends Express.Multer.File {
  key: string;        // S3 object key (hotels/xxx.jpg)
  bucket: string;     // Bucket name
  location: string;   // Public S3 URL
}
