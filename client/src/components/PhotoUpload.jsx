import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const PhotoUpload = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const API_BASE = 'http://localhost:5000/api';

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setSelectedFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(file);
                setResult(null);
            } else {
                alert('Please select an image file');
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            // Simulate object detection (replace with actual API call)
            // In production, this would call your ML model API
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock detection results based on image analysis
            const mockDetection = analyzeImage(selectedFile.name);

            setResult({
                success: true,
                detections: mockDetection.detections,
                recommendations: mockDetection.recommendations,
                confidence: mockDetection.confidence
            });
        } catch (error) {
            setResult({
                success: false,
                error: 'Failed to process image. Please try again.'
            });
        } finally {
            setIsUploading(false);
        }
    };

    const analyzeImage = (filename) => {
        // Mock object detection - replace with actual ML model
        const detections = [];
        const recommendations = [];
        
        // Simulate detecting common agricultural objects
        if (filename.toLowerCase().includes('leaf') || Math.random() > 0.5) {
            detections.push({
                type: 'Leaf',
                confidence: 85 + Math.random() * 10,
                status: Math.random() > 0.6 ? 'Healthy' : 'Disease Detected'
            });
            
            if (detections[0].status === 'Disease Detected') {
                recommendations.push('Leaf shows signs of disease. Consider applying fungicide and checking soil moisture levels.');
            } else {
                recommendations.push('Leaf appears healthy. Continue current irrigation and fertilization schedule.');
            }
        }

        if (filename.toLowerCase().includes('soil') || Math.random() > 0.6) {
            detections.push({
                type: 'Soil',
                confidence: 80 + Math.random() * 15,
                status: 'Moisture Level: Optimal'
            });
            recommendations.push('Soil moisture appears adequate. Monitor for any dry patches.');
        }

        if (filename.toLowerCase().includes('crop') || Math.random() > 0.7) {
            detections.push({
                type: 'Crop',
                confidence: 75 + Math.random() * 20,
                status: 'Growth Stage: Vegetative'
            });
            recommendations.push('Crop is in vegetative stage. Ensure adequate nitrogen levels for leaf development.');
        }

        return {
            detections: detections.length > 0 ? detections : [{
                type: 'Agricultural Scene',
                confidence: 70,
                status: 'General Analysis'
            }],
            recommendations: recommendations.length > 0 ? recommendations : [
                'Image analyzed successfully. For detailed analysis, ensure good lighting and clear focus on the subject.'
            ],
            confidence: 75 + Math.random() * 20
        };
    };

    const handleClose = () => {
        setIsOpen(false);
        setSelectedFile(null);
        setPreview(null);
        setResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            {/* Upload Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 w-16 h-16 bg-blue-500 text-white rounded-full shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center z-50 hover:bg-blue-600 transition-colors"
            >
                <Upload size={24} />
            </motion.button>

            {/* Upload Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={handleClose}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0c0c0c] border border-agri-green-500/30 rounded-3xl shadow-[0_0_50px_rgba(34,197,94,0.3)] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-agri-green-500/20 to-blue-500/20 p-6 border-b border-agri-green-500/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                        <ImageIcon size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white text-lg uppercase">Photo Analysis</h3>
                                        <p className="text-xs text-slate-400">AI-Powered Object Detection</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <X size={20} className="text-white" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Upload Area */}
                                {!preview && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="border-2 border-dashed border-agri-green-500/30 rounded-2xl p-12 text-center hover:border-agri-green-500/50 transition-colors cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload size={48} className="mx-auto text-agri-green-500 mb-4" />
                                        <p className="text-white font-bold mb-2">Click to upload or drag and drop</p>
                                        <p className="text-slate-400 text-sm">Supports: JPG, PNG, WebP</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                    </motion.div>
                                )}

                                {/* Preview */}
                                {preview && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="relative rounded-2xl overflow-hidden border border-white/10"
                                    >
                                        <img src={preview} alt="Preview" className="w-full h-auto" />
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="w-16 h-16 border-4 border-agri-green-500/20 border-t-agri-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                                                    <p className="text-white font-bold">Analyzing image...</p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Results */}
                                {result && result.success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="bg-agri-green-500/10 border border-agri-green-500/30 rounded-2xl p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <CheckCircle size={24} className="text-agri-green-500" />
                                                <h4 className="font-black text-white uppercase">Detection Results</h4>
                                            </div>
                                            <div className="space-y-3">
                                                {result.detections.map((detection, idx) => (
                                                    <div key={idx} className="bg-white/5 rounded-xl p-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-bold text-white">{detection.type}</span>
                                                            <span className="text-xs bg-agri-green-500/20 text-agri-green-400 px-2 py-1 rounded-full">
                                                                {detection.confidence.toFixed(0)}% confidence
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-300">{detection.status}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
                                            <h4 className="font-black text-white uppercase mb-3 flex items-center gap-2">
                                                <AlertCircle size={20} className="text-blue-400" />
                                                Recommendations
                                            </h4>
                                            <ul className="space-y-2">
                                                {result.recommendations.map((rec, idx) => (
                                                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                                        <span className="text-blue-400 mt-1">•</span>
                                                        <span>{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}

                                {result && !result.success && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4"
                                    >
                                        <p className="text-red-400">{result.error}</p>
                                    </motion.div>
                                )}

                                {/* Actions */}
                                {preview && !result && (
                                    <div className="flex gap-4">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleUpload}
                                            disabled={isUploading}
                                            className="flex-1 bg-agri-green-500 text-white py-4 rounded-xl font-black uppercase tracking-wider hover:bg-agri-green-600 transition-colors disabled:opacity-50"
                                        >
                                            {isUploading ? 'Analyzing...' : 'Analyze Image'}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setPreview(null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
                                            className="px-6 py-4 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors"
                                        >
                                            Change
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PhotoUpload;

