//
//  Assignment.h
//  libraries/shared/src
//
//  Created by Stephen Birarda on 8/22/13.
//  Copyright 2013 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

#ifndef __hifi__Assignment__
#define __hifi__Assignment__

#ifdef _WIN32
#include "Systime.h"
#else
#include <sys/time.h>
#endif

#include <QtCore/QUuid>

#include "NodeList.h"

const int MAX_PAYLOAD_BYTES = 1024;

const QString emptyPool = QString();

/// Holds information used for request, creation, and deployment of assignments
class Assignment : public NodeData {
    Q_OBJECT
public:

    enum Type {
        AudioMixerType,
        AvatarMixerType,
        AgentType,
        VoxelServerType,
        ParticleServerType,
        MetavoxelServerType,
        AllTypes
    };

    enum Command {
        CreateCommand,
        DeployCommand,
        RequestCommand
    };

    enum Location {
        GlobalLocation,
        LocalLocation
    };

    static Assignment::Type typeForNodeType(NodeType_t nodeType);

    Assignment();
    Assignment(Assignment::Command command,
               Assignment::Type type,
               const QString& pool = emptyPool,
               Assignment::Location location = Assignment::LocalLocation);
    Assignment(const Assignment& otherAssignment);
    Assignment& operator=(const Assignment &rhsAssignment);

    void swap(Assignment& otherAssignment);

    /// Constructs an Assignment from the data in the buffer
    /// \param dataBuffer the source buffer to un-pack the assignment from
    /// \param numBytes the number of bytes left to read in the source buffer
    Assignment(const QByteArray& packet);

    void setUUID(const QUuid& uuid) { _uuid = uuid; }
    const QUuid& getUUID() const { return _uuid; }
    void resetUUID() { _uuid = QUuid::createUuid(); }

    Assignment::Command getCommand() const { return _command; }
    Assignment::Type getType() const { return _type; }
    Assignment::Location getLocation() const { return _location; }

    const QByteArray& getPayload() const { return _payload; }
    void setPayload(const QByteArray& payload) { _payload = payload.left(MAX_PAYLOAD_BYTES); }

    void setPool(const QString& pool) { _pool = pool; };
    const QString& getPool() const { return _pool; }
    
    const char* getTypeName() const;

    // implement parseData to return 0 so we can be a subclass of NodeData
    int parseData(const QByteArray& packet) { return 0; }

    friend QDebug operator<<(QDebug debug, const Assignment& assignment);
    friend QDataStream& operator<<(QDataStream &out, const Assignment& assignment);
    friend QDataStream& operator>>(QDataStream &in, Assignment& assignment);

protected:
    QUuid _uuid; /// the 16 byte UUID for this assignment
    Assignment::Command _command; /// the command for this assignment (Create, Deploy, Request)
    Assignment::Type _type; /// the type of the assignment, defines what the assignee will do
    QString _pool; /// the destination pool for this assignment
    Assignment::Location _location; /// the location of the assignment, allows a domain to preferentially use local ACs
    QByteArray _payload; /// an optional payload attached to this assignment, a maximum for 1024 bytes will be packed
};

#endif /* defined(__hifi__Assignment__) */
