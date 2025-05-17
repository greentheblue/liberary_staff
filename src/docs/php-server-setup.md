# PHP Server Image Upload Directory Structure

## Directory Setup

For the member photo upload functionality, you need to set up the following directory structure on your PHP server:

```
/var/www/html/  (or your web root)
│
├── upload.php  (the upload script)
│
└── uploads/
    └── member_photos/  (directory to store uploaded member photos)
```

## Instructions

1. Copy the `upload.php` file to your web server's root directory.

2. Create the uploads directory structure:
   ```bash
   mkdir -p uploads/member_photos
   ```

3. Set proper permissions:
   ```bash
   chmod 755 uploads
   chmod 755 uploads/member_photos
   ```
   
4. Ensure the web server has write permissions to the uploads directory:
   ```bash
   # If using Apache with www-data user
   chown -R www-data:www-data uploads
   
   # If using another server setup, replace www-data with your web server user
   ```

5. Test the upload functionality by making a POST request to `upload.php` with an image file.

## Important Notes

- Make sure your PHP settings allow file uploads. Check that these values are properly set in your `php.ini`:
  ```
  file_uploads = On
  upload_max_filesize = 10M
  post_max_size = 10M
  max_execution_time = 30
  ```

- For security, this setup stores images outside the web root, which is ideal. If you need to store them within the web root, ensure you implement additional security measures.

- In a production environment, consider using a CDN or dedicated storage service for better performance and scalability.
