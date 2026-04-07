import React, { useState } from 'react';
import { Download, Link as LinkIcon, Loader2, CheckCircle2, AlertCircle, Instagram, Twitter, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      if (!url.includes('instagram.com') && !url.includes('tiktok.com') && !url.includes('twitter.com') && !url.includes('x.com')) {
        throw new Error('Lütfen geçerli bir X, Instagram veya TikTok linki girin.');
      }

      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İndirme işlemi başarısız oldu.');
      }

      // Handle cobalt.tools response
      let downloadUrl = '';
      if (data.status === 'redirect' || data.status === 'stream') {
        downloadUrl = data.url;
      } else if (data.status === 'picker' && data.picker && data.picker.length > 0) {
        downloadUrl = data.picker[0].url;
      } else if (data.url) {
        downloadUrl = data.url;
      } else {
        throw new Error('Medya bulunamadı veya desteklenmiyor.');
      }

      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = downloadUrl;
      // Try to force download by adding target="_blank" and download attribute
      a.target = '_blank';
      a.download = `download-${Date.now()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setStatus('success');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setUrl('');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4 font-sans text-neutral-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-center space-x-6 mb-8 text-neutral-400">
            <Twitter className="w-6 h-6" />
            <Instagram className="w-6 h-6" />
            <Video className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-semibold text-center mb-2">Medya İndirici</h1>
          <p className="text-neutral-500 text-center mb-8 text-sm">
            X, Instagram veya TikTok linkini yapıştırın
          </p>

          <form onSubmit={handleDownload} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="block w-full pl-11 pr-4 py-4 bg-neutral-100 border-transparent rounded-2xl text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black transition-all outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || !url}
              className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-base font-medium text-white bg-black hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <AnimatePresence mode="wait">
                {status === 'loading' ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    İndiriliyor...
                  </motion.div>
                ) : status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <CheckCircle2 className="-ml-1 mr-2 h-5 w-5" />
                    İndirildi!
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <Download className="-ml-1 mr-2 h-5 w-5" />
                    İndir
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </form>

          <AnimatePresence>
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-red-50 rounded-2xl flex items-start"
              >
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-600">{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="bg-neutral-50 px-8 py-4 text-center">
          <p className="text-xs text-neutral-400">
            İndirilen dosyalar doğrudan cihazınızın galerisine kaydedilir.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
