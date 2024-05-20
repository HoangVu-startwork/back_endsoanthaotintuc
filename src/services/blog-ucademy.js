const Blog = require('../models/blog.models');
const AWS = require('aws-sdk');
const { s3, filehtml, cloudfront } = require('../config/aws');
const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID;

async function getAllBlogs(location, lang, status) {
    try {
        return await Blog.find({ location, language: lang, status });
    } catch (error) {
        return error
    }
}

async function getBlogUcademy(location, status) {
    try {
        return await Blog.find({ location, status})
    } catch (error) {
        return error;
    }
}

async function getBlogByUrl(blogUrl) {
    try {
        return await Blog.findOne({ urlBlog: blogUrl })
    } catch (error) {
        return error
    }
}

async function count(blogId) {
    try {
        return await Blog.findById(blogId)
    } catch (error) {
        return error
    }
}

async function createFileHtmlEn(file, fileName, htmldist) {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: `${process.env.UCADEMY_BLOG}/blog`,
            Key: fileName,
            ContentType: 'text/html',
            Body: htmldist,
        };
        filehtml.upload(params, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.Location);
            }
        });
    });
}

async function createFileHtmlVn(file, fileNamevn, htmlvn) {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: `${process.env.UCADEMY_BLOG}/vn/blog`,
            Key: fileNamevn,
            ContentType: 'text/html',
            Body: htmlvn,
        };
        filehtml.upload(params, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.Location);
            }
        })
    })
}

async function createFileHtmlBlogen(file, fileName, htmldistblog) {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: `${process.env.UCADEMY_BLOG}/blog`,
            Key: fileName,
            ContentType: 'text/html',
            Body: htmldistblog
        };
        filehtml.upload(params, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.Location);
            }
        })
    })
}

async function createFileHtmlBlogvn(file, fileNamevn, htmlblogviewdist) {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: `${process.env.UCADEMY_BLOG}/vn/blog`,
            Key: fileNamevn,
            ContentType: 'text/html',
            Body: htmlblogviewdist
        };
        filehtml.upload(params, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.Location)
            }
        })
    })
}

async function invalidateAndDelete(fileName) {
    const invalidationParams = {
        DistributionId: DISTRIBUTION_ID,
        InvalidationBatch: {
            Paths: {
                Quantity: 1,
                Items: ['/*']
            },
            CallerReference: `${Date.now()}`
        }
    };
    try {
        const res = await cloudfront.createInvalidation(invalidationParams).promise();
        const invalidationId = res.Invalidation.Id;
    } catch (err) {
        throw err; // Rethrowing the error to halt the function if invalidation fails
    }

    // Delete file from S3
    const deleteParams = {
        Bucket: `${process.env.UCADEMY_BLOG}/blog`,
        Key: fileName
    };

    try {
        await filehtml.deleteObject(deleteParams).promise();
        return 'File deleted successfully after CloudFront invalidation';
    } catch (error) {
        throw new Error('An error occurred while deleting the html');
    }
}

async function invalidateAndDeleteVn(fileNamevn) {
    // Create CloudFront invalidation
    const invalidationParams = {
        DistributionId: DISTRIBUTION_ID,
        InvalidationBatch: {
            Paths: {
                Quantity: 1,
                Items: ['/*']
            },
            CallerReference: `${Date.now()}`
        }
    };
    try {
        const res = await cloudfront.createInvalidation(invalidationParams).promise();
        const invalidationId = res.Invalidation.Id;
    } catch (err) {
        throw err; // Rethrowing the error to halt the function if invalidation fails
    }

    // Delete file from S3
    const deleteParams = {
        Bucket: `${process.env.UCADEMY_BLOG}/vn/blog`,
        Key: fileNamevn
    };

    try {
        await filehtml.deleteObject(deleteParams).promise();
        return 'File deleted successfully after CloudFront invalidation';
    } catch (error) {
        throw new Error('An error occurred while deleting the html');
    }
}

async function filessitemaps(fileName) {
    const params = {
        Bucket: `${process.env.UCADEMY_BLOG}/blog`,
        Key: fileName
    };

    const check = filehtml.headObject(params).promise().then(() => true, error => {
        if (error.code === 'NotFound') {
            return false;
        }
        throw error;
    });

    const [exists] = await Promise.all([check]);

    return { exists };
}

async function filesExistInS3( fileNameEn, fileNameVn) {
    const paramsEn = {
        Bucket: `${process.env.UCADEMY_BLOG}/blog`,
        Key: fileNameEn
    };

    const paramsVn = {
        Bucket: `${process.env.UCADEMY_BLOG}/vn/blog`,
        Key: fileNameVn
    };

    const checkEn = filehtml.headObject(paramsEn).promise().then(() => true, error => {
        if (error.code === 'NotFound') {
            return false;
        }
        throw error;
    });

    const checkVn = filehtml.headObject(paramsVn).promise().then(() => true, error => {
        if (error.code === 'NotFound') {
            return false;
        }
        throw error;
    });

    const [existsEn, existsVn] = await Promise.all([checkEn, checkVn]);

    return { existsEn, existsVn };
}

// Create and delete xml files
async function invalidateAndDeleteXml(fileName) {
    const invalidationParams = {
        DistributionId: DISTRIBUTION_ID,
        InvalidationBatch: {
            Paths: {
                Quantity: 1,
                Items: ['/*']
            },
            CallerReference: `${Date.now()}`
        }
    };

    try {
        const res = await cloudfront.createInvalidation(invalidationParams).promise();
        const invalidationId = res.Invalidation.Id;
    } catch (err) {
        throw err; // Rethrowing the error to halt the function if invalidation fails
    }
    
    const ucademyBlogs = [process.env.UCADEMY_BLOG, process.env.UCADEMY_IO, process.env.UCADEMY_VN]; 
    for (const blog of ucademyBlogs) {
        const deleteParams = {
            Bucket: `${blog}/blog`,
            Key: fileName
        };

        try {
            await filehtml.deleteObject(deleteParams).promise();
        } catch (error) {
            throw new Error(`An error occurred while deleting the html from ${blog}`);
        }
    }
}

const ucademyBuckets = [process.env.UCADEMY_BLOG, process.env.UCADEMY_IO, process.env.UCADEMY_VN];
async function createFileHtmlBlogenXml(file, fileName, htmldistblog) {
    const uploadPromises = ucademyBuckets.map(bucket => {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: `${bucket}/blog`,
                Key: fileName,
                ContentType: 'text/html',
                Body: htmldistblog
            };
            filehtml.upload(params, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data.Location);
                }
            });
        });
    });

    return Promise.all(uploadPromises);
}

// ucademy.io blog
async function createIoFileHtmlEn(file, fileName, htmldist) {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: `${process.env.UCADEMY_IO}/blog`,
            Key: fileName,
            ContentType: 'text/html',
            Body: htmldist,
        };
        filehtml.upload(params, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.Location);
            }
        });
    });
}

async function createIoFileHtmlVn(file, fileNamevn, htmlvn) {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: `${process.env.UCADEMY_IO}/vn/blog`,
            Key: fileNamevn,
            ContentType: 'text/html',
            Body: htmlvn,
        };
        filehtml.upload(params, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.Location);
            }
        })
    })
}

async function createIoFileHtmlBlogen(file, fileName, htmldistblog) {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: `${process.env.UCADEMY_IO}/blog`,
            Key: fileName,
            ContentType: 'text/html',
            Body: htmldistblog
        };
        filehtml.upload(params, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.Location);
            }
        })
    })
}

async function createIoFileHtmlBlogvn(file, fileNamevn, htmlblogviewdist) {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: `${process.env.UCADEMY_IO}/vn/blog`,
            Key: fileNamevn,
            ContentType: 'text/html',
            Body: htmlblogviewdist
        };
        filehtml.upload(params, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.Location)
            }
        })
    })
}

async function invalidateAndIoDelete(fileName) {
    const invalidationParams = {
        DistributionId: DISTRIBUTION_ID,
        InvalidationBatch: {
            Paths: {
                Quantity: 1,
                Items: ['/*']
            },
            CallerReference: `${Date.now()}`
        }
    };
    try {
        const res = await cloudfront.createInvalidation(invalidationParams).promise();
        const invalidationId = res.Invalidation.Id;
    } catch (err) {
        throw err; // Rethrowing the error to halt the function if invalidation fails
    }

    // Delete file from S3
    const deleteParams = {
        Bucket: `${process.env.UCADEMY_IO}/blog`,
        Key: fileName
    };

    try {
        await filehtml.deleteObject(deleteParams).promise();
        return 'File deleted successfully after CloudFront invalidation';
    } catch (error) {
        throw new Error('An error occurred while deleting the html');
    }
}

async function invalidateAndIoDeleteVn(fileNamevn) {
    // Create CloudFront invalidation
    const invalidationParams = {
        DistributionId: DISTRIBUTION_ID,
        InvalidationBatch: {
            Paths: {
                Quantity: 1,
                Items: ['/*']
            },
            CallerReference: `${Date.now()}`
        }
    };
    try {
        const res = await cloudfront.createInvalidation(invalidationParams).promise();
        const invalidationId = res.Invalidation.Id;
    } catch (err) {
        throw err; // Rethrowing the error to halt the function if invalidation fails
    }

    // Delete file from S3
    const deleteParams = {
        Bucket: `${process.env.UCADEMY_IO}/vn/blog`,
        Key: fileNamevn
    };

    try {
        await filehtml.deleteObject(deleteParams).promise();
        return 'File deleted successfully after CloudFront invalidation';
    } catch (error) {
        throw new Error('An error occurred while deleting the html');
    }
}

async function filesIoExistInS3( fileNameEn, fileNameVn) {
    const paramsEn = {
        Bucket: `${process.env.UCADEMY_IO}/blog`,
        Key: fileNameEn
    };

    const paramsVn = {
        Bucket: `${process.env.UCADEMY_IO}/vn/blog`,
        Key: fileNameVn
    };

    const checkEn = filehtml.headObject(paramsEn).promise().then(() => true, error => {
        if (error.code === 'NotFound') {
            return false;
        }
        throw error;
    });

    const checkVn = filehtml.headObject(paramsVn).promise().then(() => true, error => {
        if (error.code === 'NotFound') {
            return false;
        }
        throw error;
    });

    const [existsEn, existsVn] = await Promise.all([checkEn, checkVn]);

    return { existsEn, existsVn };
}

// ucademy.vn blog
async function createVnFileHtmlEn(file, fileName, htmldist) {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: `${process.env.UCADEMY_VN}/en/blog`,
            Key: fileName,
            ContentType: 'text/html',
            Body: htmldist,
        };
        filehtml.upload(params, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.Location);
            }
        });
    });
}

async function createVnFileHtmlVn(file, fileNamevn, htmlvn) {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: `${process.env.UCADEMY_VN}/blog`,
            Key: fileNamevn,
            ContentType: 'text/html',
            Body: htmlvn,
        };
        filehtml.upload(params, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.Location);
            }
        })
    })
}

async function createVnFileHtmlBlogen(file, fileName, htmldistblog) {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: `${process.env.UCADEMY_VN}/en/blog`,
            Key: fileName,
            ContentType: 'text/html',
            Body: htmldistblog
        };
        filehtml.upload(params, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.Location);
            }
        })
    })
}

async function createVnFileHtmlBlogvn(file, fileNamevn, htmlblogviewdist) {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: `${process.env.UCADEMY_VN}/blog`,
            Key: fileNamevn,
            ContentType: 'text/html',
            Body: htmlblogviewdist
        };
        filehtml.upload(params, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.Location)
            }
        })
    })
}

async function invalidateAndVnDelete(fileName) {
    const invalidationParams = {
        DistributionId: DISTRIBUTION_ID,
        InvalidationBatch: {
            Paths: {
                Quantity: 1,
                Items: ['/*']
            },
            CallerReference: `${Date.now()}`
        }
    };
    try {
        const res = await cloudfront.createInvalidation(invalidationParams).promise();
        const invalidationId = res.Invalidation.Id;
    } catch (err) {
        throw err; // Rethrowing the error to halt the function if invalidation fails
    }

    // Delete file from S3
    const deleteParams = {
        Bucket: `${process.env.UCADEMY_VN}/en/blog`,
        Key: fileName
    };

    try {
        await filehtml.deleteObject(deleteParams).promise();
        return 'File deleted successfully after CloudFront invalidation';
    } catch (error) {
        throw new Error('An error occurred while deleting the html');
    }
}

async function invalidateAndVnDeleteVn(fileNamevn) {
    // Create CloudFront invalidation
    const invalidationParams = {
        DistributionId: DISTRIBUTION_ID,
        InvalidationBatch: {
            Paths: {
                Quantity: 1,
                Items: ['/*']
            },
            CallerReference: `${Date.now()}`
        }
    };
    try {
        const res = await cloudfront.createInvalidation(invalidationParams).promise();
        const invalidationId = res.Invalidation.Id;
    } catch (err) {
        throw err; // Rethrowing the error to halt the function if invalidation fails
    }

    // Delete file from S3
    const deleteParams = {
        Bucket: `${process.env.UCADEMY_VN}/blog`,
        Key: fileNamevn
    };

    try {
        await filehtml.deleteObject(deleteParams).promise();
        return 'File deleted successfully after CloudFront invalidation';
    } catch (error) {
        throw new Error('An error occurred while deleting the html');
    }
}

async function filesVnExistInS3( fileNameEn, fileNameVn) {
    const paramsEn = {
        Bucket: `${process.env.UCADEMY_VN}/en/blog`,
        Key: fileNameEn
    };

    const paramsVn = {
        Bucket: `${process.env.UCADEMY_VN}/blog`,
        Key: fileNameVn
    };

    const checkEn = filehtml.headObject(paramsEn).promise().then(() => true, error => {
        if (error.code === 'NotFound') {
            return false;
        }
        throw error;
    });

    const checkVn = filehtml.headObject(paramsVn).promise().then(() => true, error => {
        if (error.code === 'NotFound') {
            return false;
        }
        throw error;
    });

    const [existsEn, existsVn] = await Promise.all([checkEn, checkVn]);

    return { existsEn, existsVn };
}

module.exports = {
    getAllBlogs,
    getBlogByUrl,
    count,
    createFileHtmlEn,
    createFileHtmlVn,
    createFileHtmlBlogen,
    createFileHtmlBlogvn,
    invalidateAndDelete,
    invalidateAndDeleteVn,
    filesExistInS3,
    getBlogUcademy,
    filessitemaps,
    invalidateAndDeleteXml,
    createFileHtmlBlogenXml,
    createIoFileHtmlEn,
    createIoFileHtmlVn,
    createIoFileHtmlBlogen,
    createIoFileHtmlBlogvn,
    invalidateAndIoDelete,
    invalidateAndIoDeleteVn,
    filesIoExistInS3,
    createVnFileHtmlEn,
    createVnFileHtmlVn,
    createVnFileHtmlBlogen,
    createVnFileHtmlBlogvn,
    invalidateAndVnDelete,
    invalidateAndVnDeleteVn,
    filesVnExistInS3
}