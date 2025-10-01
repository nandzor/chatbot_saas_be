# OAuth Integration User Guide

## Getting Started

This guide will help you set up and use OAuth integration with Google services (Sheets, Docs, Drive) for your chatbot automation workflows.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting Up OAuth](#setting-up-oauth)
3. [Connecting Google Services](#connecting-google-services)
4. [Selecting Files](#selecting-files)
5. [Configuring Workflows](#configuring-workflows)
6. [Monitoring and Management](#monitoring-and-management)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Prerequisites

Before you begin, ensure you have:

- ✅ **Admin Access**: Organization admin permissions
- ✅ **Google Account**: Active Google account with access to Sheets, Docs, and Drive
- ✅ **File Access**: Files you want to monitor must be accessible to your Google account
- ✅ **Internet Connection**: Stable internet connection for OAuth flow

## Setting Up OAuth

### Step 1: Access OAuth File Selection

1. Log in to your organization dashboard
2. Navigate to **OAuth File Selection** from the sidebar
3. You'll see the OAuth integration interface

### Step 2: Understand the Interface

The OAuth File Selection page has several sections:

- **Service Selection**: Connect/disconnect Google services
- **File Browser**: Browse and select files
- **Workflow Configuration**: Configure automation settings
- **Status Overview**: Monitor connection status

## Connecting Google Services

### Step 1: Connect Google Sheets

1. In the **Service Selection** section, find **Google Sheets**
2. Click the **Connect** button
3. You'll be redirected to Google's OAuth consent screen
4. Review the permissions and click **Allow**
5. You'll be redirected back to the application
6. The status will show **Connected** with a green indicator

### Step 2: Connect Google Docs

1. Find **Google Docs** in the Service Selection section
2. Click **Connect**
3. Complete the OAuth flow as above
4. Status will update to **Connected**

### Step 3: Connect Google Drive

1. Find **Google Drive** in the Service Selection section
2. Click **Connect**
3. Complete the OAuth flow
4. Status will show **Connected**

### Understanding Permissions

When you connect a service, you'll see these permissions:

- **Google Sheets**: Read access to spreadsheets and drive files
- **Google Docs**: Read access to documents and drive files  
- **Google Drive**: Read access to drive files and metadata

These permissions allow the system to:
- Monitor file changes
- Read file content
- Access file metadata
- Create automation workflows

## Selecting Files

### Step 1: Browse Files

1. Once connected, click on a service to browse files
2. Use the **Search** box to find specific files
3. Use **File Type** filter to show only Sheets, Docs, or all files
4. Toggle between **Grid** and **List** view modes

### Step 2: Select Files

1. **Single Selection**: Click on a file to select it
2. **Multiple Selection**: Click multiple files to select them
3. **Bulk Selection**: Use checkboxes in list view for bulk selection
4. **Preview**: Click **Preview** to see file details before selecting

### Step 3: File Preview

The file preview shows:

- **File Information**: Name, type, size, creation date
- **Permissions**: Who has access to the file
- **Metadata**: File statistics and properties
- **Actions**: Open in Google, download, or remove from selection

### Step 4: Manage Selection

- **Selected Files Summary**: See count of selected files
- **Remove Files**: Click **Remove** to deselect files
- **Clear All**: Use **Clear All** to deselect all files

## Configuring Workflows

### Step 1: Configure Workflow Settings

1. Click **Configure Workflow** button
2. The Workflow Configuration modal will open
3. Configure the following settings:

#### Sync Settings
- **Sync Interval**: How often to check for changes (1 minute to 4 hours)
- **Include Metadata**: Whether to include file metadata in processing
- **Auto Process**: Whether to automatically process changes

#### Notification Settings
- **Enable Notifications**: Receive notifications for workflow events

#### Error Handling
- **Retry Attempts**: Number of retry attempts for failed operations (1-10)
- **Retry Delay**: Delay between retry attempts (100ms-10s)

### Step 2: Review Configuration

The configuration preview shows:

- **Workflow Type**: OAuth-based file monitoring
- **Monitoring**: Number of files being monitored
- **Sync Frequency**: How often files are checked
- **Auto Processing**: Whether changes are processed automatically
- **Notifications**: Whether notifications are enabled
- **Error Handling**: Retry configuration

### Step 3: Create Workflow

1. Review your configuration
2. Click **Create Workflow**
3. The system will:
   - Create N8N credentials
   - Set up monitoring workflows
   - Configure file processing
   - Enable notifications

4. You'll see a success message with the number of workflows created

## Monitoring and Management

### Step 1: Monitor Connection Status

The **Connection Status** section shows:

- **Service Status**: Connected/Disconnected for each service
- **Last Sync**: When files were last checked
- **Error Count**: Number of errors in the last 24 hours
- **Active Workflows**: Number of active monitoring workflows

### Step 2: Test Connections

1. Click the **Refresh** button next to any service
2. The system will test the connection
3. Status will update based on the test result

### Step 3: Disconnect Services

1. Click **Disconnect** next to any service
2. Confirm the disconnection
3. All workflows for that service will be stopped
4. Credentials will be revoked

### Step 4: View Error Statistics

1. Click **Error Statistics** to view error details
2. See error types and frequencies
3. Get suggestions for resolving errors
4. Clear error statistics if needed

## Troubleshooting

### Common Issues and Solutions

#### 1. Connection Failed

**Symptoms:**
- Red "Disconnected" status
- Error message: "Connection test failed"

**Solutions:**
1. Check your internet connection
2. Verify Google account is active
3. Try reconnecting the service
4. Check if Google services are down

#### 2. Permission Denied

**Symptoms:**
- Error: "Access denied"
- Cannot see files

**Solutions:**
1. Ensure you have access to the files
2. Check Google account permissions
3. Reconnect the service to refresh permissions
4. Contact file owner for access

#### 3. Files Not Loading

**Symptoms:**
- Empty file list
- Loading spinner never stops

**Solutions:**
1. Check if files exist in Google Drive
2. Verify file permissions
3. Try refreshing the file list
4. Check for network issues

#### 4. Workflow Creation Failed

**Symptoms:**
- Error: "Failed to create workflow"
- Workflow status shows "Failed"

**Solutions:**
1. Check N8N server status
2. Verify service connection
3. Try creating workflow again
4. Contact support if issue persists

### Error Messages

#### Network Errors
- **"Network timeout"**: Check internet connection
- **"Network unreachable"**: Check network settings
- **"DNS resolution failed"**: Check DNS settings

#### Authentication Errors
- **"Token expired"**: Reconnect the service
- **"Invalid credentials"**: Reconnect the service
- **"Access denied"**: Check permissions

#### Service Errors
- **"Quota exceeded"**: Wait and try again later
- **"Rate limit exceeded"**: Wait and try again
- **"Service unavailable"**: Try again later

### Getting Help

If you encounter issues:

1. **Check Error Statistics**: View detailed error information
2. **Review Logs**: Check system logs for technical details
3. **Contact Support**: Reach out to support team
4. **Community Forum**: Check community forums for solutions

## Best Practices

### Security

1. **Regular Review**: Periodically review connected services
2. **Minimal Permissions**: Only connect services you need
3. **Secure Access**: Use secure networks when connecting
4. **Monitor Access**: Regularly check who has access to your files

### Performance

1. **Reasonable Sync Intervals**: Don't set sync intervals too low
2. **Selective Monitoring**: Only monitor files you actually need
3. **Regular Cleanup**: Remove unused workflows
4. **Monitor Usage**: Keep track of API usage

### File Management

1. **Organize Files**: Keep files well-organized in Google Drive
2. **Clear Naming**: Use clear, descriptive file names
3. **Regular Updates**: Keep files up to date
4. **Backup Important Files**: Maintain backups of critical files

### Workflow Management

1. **Test Workflows**: Test workflows before going live
2. **Monitor Performance**: Keep an eye on workflow performance
3. **Update Configurations**: Update configurations as needed
4. **Document Changes**: Document any changes you make

## Advanced Features

### Bulk Operations

- **Bulk File Selection**: Select multiple files at once
- **Bulk Workflow Creation**: Create workflows for multiple files
- **Bulk Service Management**: Connect/disconnect multiple services

### Custom Configurations

- **Custom Sync Intervals**: Set specific sync intervals per workflow
- **Custom Error Handling**: Configure retry logic per workflow
- **Custom Notifications**: Set up specific notification rules

### Integration Options

- **Webhook Integration**: Set up webhooks for real-time notifications
- **API Integration**: Use APIs for custom integrations
- **Third-party Tools**: Integrate with other automation tools

## Support and Resources

### Documentation
- **API Reference**: Complete API documentation
- **Technical Guide**: Detailed technical implementation guide
- **FAQ**: Frequently asked questions

### Support Channels
- **Email Support**: support@company.com
- **Live Chat**: Available during business hours
- **Community Forum**: User community and discussions
- **Video Tutorials**: Step-by-step video guides

### Updates and News
- **Release Notes**: Latest feature updates
- **Security Updates**: Important security information
- **Best Practices**: Updated best practices and recommendations

---

**Need Help?** Contact our support team at support@company.com or visit our community forum for assistance.

**Last Updated**: October 2025  
**Version**: 1.0.0
