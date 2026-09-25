module.exports = {
  apps: [
    {
      name: "umrahspot-backend",
      cwd: "/var/www/app/backend",
      script: "dist/index.js",

      instances: 1,      
      exec_mode: "fork",

      env: {
        NODE_ENV: "development"
      },

      env_production: {
        NODE_ENV: "production"
      },

      autorestart: true,
      max_memory_restart: "512M",
      watch: false,
      restart_delay: 5000,

      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "/var/www/app/backend/logs/error.log",
      out_file: "/var/www/app/backend/logs/out.log",
      merge_logs: true
    }
  ]
};
