//
//  UpdateDialog.h
//  interface/src/ui
//
//  Copyright 2014 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

#ifndef __hifi__UpdateDialog__
#define __hifi__UpdateDialog__

#include <QWidget>

class UpdateDialog : public QDialog {
    Q_OBJECT
    
public:
    UpdateDialog(QWidget* parent, const QString& releaseNotes, const QString& latestVersion, const QUrl& downloadURL);
    
private:
    QString _latestVersion;
    QUrl _downloadUrl;
    
private slots:
    void handleDownload();
    void handleSkip();
};

#endif /* defined(__hifi__UpdateDialog__) */
