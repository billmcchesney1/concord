package com.walmartlabs.concord.server.process.queue;

/*-
 * *****
 * Concord
 * -----
 * Copyright (C) 2017 - 2019 Walmart Inc.
 * -----
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =====
 */

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import javax.annotation.Nullable;
import java.io.Serializable;

/**
 * The inheriting classes MUST override {@link #equals(Object)}) if they
 * provide additional fields.
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        visible = false,
        property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = NoneCondition.class, name = "NONE"),
        @JsonSubTypes.Type(value = ImmutableProcessCompletionCondition.class, name = "PROCESS_COMPLETION"),
        @JsonSubTypes.Type(value = ImmutableProcessLockCondition.class, name = "PROCESS_LOCK")
})
public abstract class AbstractWaitCondition implements Serializable {

    public abstract WaitType type();

    @Nullable
    public abstract String reason();
}
